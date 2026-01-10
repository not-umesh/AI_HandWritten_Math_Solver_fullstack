"""
AI Handwritten Math Solver - Flask Backend (Memory Optimized)
"""

import os
import gc
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import base64
from io import BytesIO

load_dotenv()

app = Flask(__name__)
CORS(app)

# Lazy loading - only initialize when needed
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

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'app': 'AI Handwritten Math Solver',
        'version': '1.0.0'
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Server is running'})

@app.route('/solve', methods=['POST'])
def solve_equation():
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        
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
        
        # Solve equation
        solver = get_math_solver()
        solution = solver.solve(equation_text)
        
        # Clean up
        gc.collect()
        
        return jsonify({
            'success': True,
            'detected_equation': equation_text,
            'cleaned_equation': equation_text,
            'ocr_method': 'gemini',
            'solution': solution['answer'],
            'steps': solution['steps'],
            'explanation': solution['explanation'],
            'equation_type': solution['type']
        })
        
    except Exception as e:
        traceback.print_exc()
        gc.collect()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/solve-text', methods=['POST'])
def solve_text_equation():
    try:
        data = request.get_json()
        
        if not data or 'equation' not in data:
            return jsonify({'success': False, 'error': 'No equation provided'}), 400
        
        equation = data['equation']
        solver = get_math_solver()
        solution = solver.solve(equation)
        
        gc.collect()
        
        return jsonify({
            'success': True,
            'original_equation': equation,
            'cleaned_equation': equation,
            'solution': solution['answer'],
            'steps': solution['steps'],
            'explanation': solution['explanation'],
            'equation_type': solution['type']
        })
        
    except Exception as e:
        traceback.print_exc()
        gc.collect()
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)