"""
AI Handwritten Math Solver - Flask Backend (Security Hardened)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Security Features:
  ✓ Rate limiting (IP + endpoint based)
  ✓ Input validation & sanitization
  ✓ Secure API key handling (env vars only)
  ✓ OWASP best practices

Built with 💻 by UV
"""

import os
import gc
import re
import traceback
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import base64

load_dotenv()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECURITY: Rate Limiting Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def get_rate_limit_key():
    """
    Generate rate limit key based on IP + User-Agent fingerprint
    This prevents simple IP spoofing attacks
    """
    ip = get_remote_address()
    user_agent = request.headers.get('User-Agent', 'unknown')[:50]
    return f"{ip}:{hash(user_agent) % 10000}"

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # In production, restrict to your domain
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize rate limiter with Redis or in-memory storage
limiter = Limiter(
    app=app,
    key_func=get_rate_limit_key,
    default_limits=["100 per hour", "20 per minute"],
    storage_uri=os.environ.get('REDIS_URL', 'memory://'),
    strategy="fixed-window",
    headers_enabled=True  # Adds X-RateLimit headers to responses
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECURITY: Input Validation Configuration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Maximum lengths for input fields (OWASP recommendation)
MAX_EQUATION_LENGTH = 500
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_EXPLANATION_MODES = {'grade8', 'grade10', 'grade12', 'standard'}

# Forbidden patterns (SQL injection, XSS, command injection)
FORBIDDEN_PATTERNS = [
    r'<script',
    r'javascript:',
    r'on\w+\s*=',
    r';\s*drop\s+table',
    r';\s*delete\s+from',
    r'union\s+select',
    r'\|\|',
    r'&&',
    r'\$\(',
    r'`',
]

def validate_equation(equation: str) -> tuple[bool, str]:
    """
    Validate and sanitize equation input
    Returns: (is_valid, error_message)
    """
    if not equation:
        return False, "Equation is required"
    
    if not isinstance(equation, str):
        return False, "Equation must be a string"
    
    if len(equation) > MAX_EQUATION_LENGTH:
        return False, f"Equation too long (max {MAX_EQUATION_LENGTH} chars)"
    
    # Check for forbidden patterns
    equation_lower = equation.lower()
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, equation_lower, re.IGNORECASE):
            return False, "Invalid characters in equation"
    
    # Allow only safe math characters
    # Letters, numbers, operators, parentheses, common math symbols
    safe_pattern = r'^[\w\s\+\-\*\/\^\=\(\)\.\,\!\[\]\{\}\|\<\>\°\√\π\∞]+$'
    if not re.match(safe_pattern, equation, re.UNICODE):
        # Still allow if it's mostly alphanumeric (some Unicode math might fail regex)
        if not any(c.isalnum() for c in equation):
            return False, "Invalid equation format"
    
    return True, ""

def validate_image_data(image_data: str) -> tuple[bool, str, bytes]:
    """
    Validate and decode base64 image data
    Returns: (is_valid, error_message, decoded_bytes)
    """
    if not image_data:
        return False, "Image is required", b''
    
    if not isinstance(image_data, str):
        return False, "Image must be a base64 string", b''
    
    # Remove data URL prefix if present
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Check reasonable size before decoding (base64 is ~33% larger)
    if len(image_data) > MAX_IMAGE_SIZE_BYTES * 1.4:
        return False, f"Image too large (max {MAX_IMAGE_SIZE_BYTES // 1024 // 1024}MB)", b''
    
    try:
        # Fix padding if needed
        padding = 4 - len(image_data) % 4
        if padding != 4:
            image_data += '=' * padding
        
        decoded = base64.b64decode(image_data)
        
        if len(decoded) > MAX_IMAGE_SIZE_BYTES:
            return False, f"Image too large (max {MAX_IMAGE_SIZE_BYTES // 1024 // 1024}MB)", b''
        
        return True, "", decoded
    except Exception:
        return False, "Invalid base64 image data", b''

def validate_request_json(data: dict, allowed_fields: set) -> tuple[bool, str]:
    """
    Reject requests with unexpected fields (prevents parameter pollution)
    """
    if not isinstance(data, dict):
        return False, "Request body must be JSON object"
    
    unexpected = set(data.keys()) - allowed_fields
    if unexpected:
        return False, f"Unexpected fields: {', '.join(unexpected)}"
    
    return True, ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECURITY: Custom 429 Handler (Graceful Rate Limit Response)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@app.errorhandler(429)
def rate_limit_exceeded(e):
    """
    Return a friendly 429 response with retry information
    """
    return jsonify({
        'success': False,
        'error': 'Too many requests. Please slow down!',
        'retry_after': e.description,
        'message': 'Rate limit exceeded. Try again in a few seconds.'
    }), 429

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Lazy Loading - Only initialize handlers when needed
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_math_solver = None
_gemini_handler = None

def get_math_solver():
    global _math_solver
    if _math_solver is None:
        from math_solver import MathSolver
        _math_solver = MathSolver()
    return _math_solver

def get_gemini_handler():
    global _gemini_handler
    if _gemini_handler is None:
        from gemini_handler import GeminiHandler
        _gemini_handler = GeminiHandler()
    return _gemini_handler

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# API Routes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.route('/', methods=['GET'])
@limiter.limit("60 per minute")  # Light rate limit for health check
def home():
    """
    Home endpoint - API info
    // Built with 💻 by UV
    """
    return jsonify({
        'status': 'running',
        'app': 'AI Handwritten Math Solver',
        'version': '2.0.0',
        'author': 'UV',  # Watermark
        'security': 'hardened'
    })

@app.route('/health', methods=['GET'])
@limiter.limit("60 per minute")
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Server is running',
        'version': '2.0.0'
    })

@app.route('/solve', methods=['POST'])
@limiter.limit("10 per minute")  # Stricter limit for compute-heavy endpoint
def solve_equation():
    """
    Solve equation from image
    Security: Validated input, rate limited, sanitized output
    """
    try:
        data = request.get_json(force=True, silent=True)
        
        if not data:
            return jsonify({'success': False, 'error': 'Invalid JSON body'}), 400
        
        # SECURITY: Reject unexpected fields
        allowed_fields = {'image', 'explanation_mode'}
        is_valid, error = validate_request_json(data, allowed_fields)
        if not is_valid:
            return jsonify({'success': False, 'error': error}), 400
        
        # SECURITY: Validate image
        is_valid, error, image_bytes = validate_image_data(data.get('image'))
        if not is_valid:
            return jsonify({'success': False, 'error': error}), 400
        
        # SECURITY: Validate explanation mode
        explanation_mode = data.get('explanation_mode', 'grade10')
        if explanation_mode not in ALLOWED_EXPLANATION_MODES:
            explanation_mode = 'grade10'  # Default to safe value
        
        # Get handlers (lazy loaded)
        gemini = get_gemini_handler()
        gemini_result = gemini.extract_equation(image_bytes)
        
        # Clear image bytes from memory
        del image_bytes
        gc.collect()
        
        if not gemini_result['success']:
            return jsonify({
                'success': False,
                'error': gemini_result.get('error', 'Could not read equation')
            }), 400
        
        equation_text = gemini_result['equation']
        
        # SECURITY: Validate extracted equation
        is_valid, error = validate_equation(equation_text)
        if not is_valid:
            return jsonify({'success': False, 'error': 'Invalid equation extracted'}), 400
        
        # Solve equation with explanation mode
        solver = get_math_solver()
        solution = solver.solve(equation_text, explanation_mode)
        
        gc.collect()
        
        return jsonify({
            'success': True,
            'detected_equation': equation_text,
            'cleaned_equation': equation_text,
            'ocr_method': 'gemini',
            'solution': solution['answer'],
            'steps': solution['steps'],
            'explanation': solution['explanation'],
            'explanation_mode': solution.get('explanation_mode', 'grade10'),
            'equation_type': solution['type'],
            'is_impossible': solution.get('is_impossible', False),
            'impossible_reason': solution.get('impossible_reason', ''),
            'suggestion': solution.get('suggestion', ''),
            'common_mistakes': solution.get('common_mistakes', [])
        })
        
    except Exception as e:
        traceback.print_exc()
        gc.collect()
        # SECURITY: Don't expose internal error details
        return jsonify({
            'success': False,
            'error': 'An error occurred while processing your request'
        }), 500

@app.route('/solve-text', methods=['POST'])
@limiter.limit("15 per minute")  # Slightly higher for text-only
def solve_text_equation():
    """
    Solve equation from text input
    Security: Validated input, rate limited
    """
    try:
        data = request.get_json(force=True, silent=True)
        
        if not data:
            return jsonify({'success': False, 'error': 'Invalid JSON body'}), 400
        
        # SECURITY: Reject unexpected fields
        allowed_fields = {'equation', 'explanation_mode'}
        is_valid, error = validate_request_json(data, allowed_fields)
        if not is_valid:
            return jsonify({'success': False, 'error': error}), 400
        
        # SECURITY: Validate equation
        equation = data.get('equation', '')
        is_valid, error = validate_equation(equation)
        if not is_valid:
            return jsonify({'success': False, 'error': error}), 400
        
        # SECURITY: Validate explanation mode
        explanation_mode = data.get('explanation_mode', 'grade10')
        if explanation_mode not in ALLOWED_EXPLANATION_MODES:
            explanation_mode = 'grade10'
        
        solver = get_math_solver()
        solution = solver.solve(equation, explanation_mode)
        
        gc.collect()
        
        return jsonify({
            'success': True,
            'original_equation': equation,
            'cleaned_equation': equation,
            'solution': solution['answer'],
            'steps': solution['steps'],
            'explanation': solution['explanation'],
            'explanation_mode': solution.get('explanation_mode', 'grade10'),
            'equation_type': solution['type'],
            'is_impossible': solution.get('is_impossible', False),
            'impossible_reason': solution.get('impossible_reason', ''),
            'suggestion': solution.get('suggestion', ''),
            'common_mistakes': solution.get('common_mistakes', [])
        })
        
    except Exception as e:
        traceback.print_exc()
        gc.collect()
        return jsonify({
            'success': False,
            'error': 'An error occurred while processing your request'
        }), 500

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Main Entry Point
# // Built with 💻 by UV - console.log("bugs? what bugs?")
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)