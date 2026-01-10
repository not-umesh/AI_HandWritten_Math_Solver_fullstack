"""
AI Handwritten Math Solver - Flask Backend
"""

import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import base64
from io import BytesIO
from PIL import Image

from math_solver import MathSolver
from gemini_handler import GeminiHandler

load_dotenv()

app = Flask(__name__)
CORS(app)

math_solver = MathSolver()
gemini_handler = GeminiHandler()

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
        
        # Use Gemini to extract equation
        gemini_result = gemini_handler.extract_equation(image_bytes)
        
        if not gemini_result['success']:
            return jsonify({
                'success': False,
                'error': gemini_result.get('error', 'Could not read equation')
            }), 400
        
        equation_text = gemini_result['equation']
        
        # Solve equation
        solution = math_solver.solve(equation_text)
        
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
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/solve-text', methods=['POST'])
def solve_text_equation():
    try:
        data = request.get_json()
        
        if not data or 'equation' not in data:
            return jsonify({'success': False, 'error': 'No equation provided'}), 400
        
        equation = data['equation']
        solution = math_solver.solve(equation)
        
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
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)