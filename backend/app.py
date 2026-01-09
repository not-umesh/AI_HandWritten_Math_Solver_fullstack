"""
AI Handwritten Math Solver - Main Flask Application
Deploy on Render with environment variables
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import base64
from io import BytesIO
from PIL import Image
import traceback

from ocr_handler import OCRHandler
from math_solver import MathSolver
from gemini_handler import GeminiHandler
from utils import preprocess_image, validate_image

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize handlers
ocr_handler = OCRHandler()
math_solver = MathSolver()
gemini_handler = GeminiHandler()

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'app': 'AI Handwritten Math Solver',
        'version': '1.0.0',
        'endpoints': {
            '/solve': 'POST - Solve math equation from image',
            '/health': 'GET - Health check',
            '/test-ocr': 'POST - Test OCR only',
            '/solve-text': 'POST - Solve text equation'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'healthy', 'message': 'Server is running'})

@app.route('/solve', methods=['POST'])
def solve_equation():
    """
    Main endpoint to solve handwritten math equations
    Accepts: Base64 encoded image
    Returns: Solution with steps
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        # Decode base64 image
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Validate image
        if not validate_image(image):
            return jsonify({
                'success': False,
                'error': 'Invalid image format'
            }), 400
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Try Tesseract OCR first
        equation_text = ocr_handler.extract_text(processed_image)
        ocr_method = 'tesseract'
        
        # If Tesseract fails or returns poor results, try Gemini Vision
        if not equation_text or len(equation_text.strip()) < 2:
            gemini_result = gemini_handler.extract_equation(image_bytes)
            if gemini_result['success']:
                equation_text = gemini_result['equation']
                ocr_method = 'gemini'
        
        if not equation_text or len(equation_text.strip()) < 2:
            return jsonify({
                'success': False,
                'error': 'Could not recognize any equation. Please try again with a clearer image.',
                'tips': [
                    'Write larger and clearer',
                    'Use dark ink on white paper',
                    'Ensure good lighting',
                    'Avoid shadows on the paper'
                ]
            }), 400
        
        # Clean and parse the equation
        cleaned_equation = ocr_handler.clean_equation(equation_text)
        
        # Solve the equation
        solution = math_solver.solve(cleaned_equation)
        
        return jsonify({
            'success': True,
            'detected_equation': equation_text,
            'cleaned_equation': cleaned_equation,
            'ocr_method': ocr_method,
            'solution': solution['answer'],
            'steps': solution['steps'],
            'explanation': solution['explanation'],
            'equation_type': solution['type']
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/solve-text', methods=['POST'])
def solve_text_equation():
    """Solve equation from text input"""
    try:
        data = request.get_json()
        
        if not data or 'equation' not in data:
            return jsonify({
                'success': False,
                'error': 'No equation provided'
            }), 400
        
        equation = data['equation']
        cleaned = ocr_handler.clean_equation(equation)
        solution = math_solver.solve(cleaned)
        
        return jsonify({
            'success': True,
            'original_equation': equation,
            'cleaned_equation': cleaned,
            'solution': solution['answer'],
            'steps': solution['steps'],
            'explanation': solution['explanation'],
            'equation_type': solution['type']
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/test-ocr', methods=['POST'])
def test_ocr():
    """Test OCR functionality only"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'error': 'No image provided'
            }), 400
        
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        processed_image = preprocess_image(image)
        
        # Tesseract result
        tesseract_text = ocr_handler.extract_text(processed_image)
        
        # Gemini result
        gemini_result = gemini_handler.extract_equation(image_bytes)
        
        return jsonify({
            'success': True,
            'tesseract': tesseract_text,
            'gemini': gemini_result,
            'cleaned': ocr_handler.clean_equation(tesseract_text or gemini_result.get('equation', ''))
        })
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)