"""
Gemini Handler - Google Gemini Vision API
"""

import os
import google.generativeai as genai
from PIL import Image
from io import BytesIO

class GeminiHandler:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY', '')
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
            except Exception as e:
                print(f"Gemini init error: {e}")
    
    def extract_equation(self, image_bytes):
        if not self.model:
            return {
                'success': False,
                'error': 'Gemini API not configured',
                'equation': ''
            }
        
        try:
            image = Image.open(BytesIO(image_bytes))
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            prompt = """Extract the mathematical equation from this handwritten image.
Return ONLY the equation using standard notation (+, -, *, /, =, ^, sqrt).
Use x, y, z for variables. No explanation, just the equation."""
            
            response = self.model.generate_content([prompt, image])
            
            if response.text:
                equation = response.text.strip()
                equation = equation.replace('```', '').strip()
                return {
                    'success': True,
                    'equation': equation
                }
            else:
                return {
                    'success': False,
                    'error': 'No equation detected',
                    'equation': ''
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'equation': ''
            }