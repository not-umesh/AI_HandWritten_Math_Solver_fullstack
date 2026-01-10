"""
Gemini Handler - Google Gemini Vision API (Memory Optimized)
"""

import os
import gc

class GeminiHandler:
    def __init__(self):
        self.api_key = os.environ.get('GEMINI_API_KEY', '')
        self.model = None
        
        if self.api_key:
            try:
                import google.generativeai as genai
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
            from PIL import Image
            from io import BytesIO
            
            # Open and resize image to reduce memory
            image = Image.open(BytesIO(image_bytes))
            
            # Resize large images to max 800px
            max_size = 800
            if image.width > max_size or image.height > max_size:
                ratio = min(max_size / image.width, max_size / image.height)
                new_size = (int(image.width * ratio), int(image.height * ratio))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            prompt = """Extract the mathematical equation from this handwritten image.
Return ONLY the equation using standard notation (+, -, *, /, =, ^, sqrt).
Use x, y, z for variables. No explanation, just the equation."""
            
            response = self.model.generate_content([prompt, image])
            
            # Clean up
            del image
            gc.collect()
            
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
            gc.collect()
            return {
                'success': False,
                'error': str(e),
                'equation': ''
            }