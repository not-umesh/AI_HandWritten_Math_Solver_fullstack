"""
Gemini Handler - Google Gemini Vision API for better OCR
"""

import os
import base64
import google.generativeai as genai
from PIL import Image
from io import BytesIO

class GeminiHandler:
    def __init__(self):
        # Get API key from environment variable
        self.api_key = os.environ.get('GEMINI_API_KEY', '')
        self.model = None
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Gemini initialization error: {e}")
    
    def extract_equation(self, image_bytes):
        """
        Use Gemini Vision to extract equation from image
        """
        if not self.model:
            return {
                'success': False,
                'error': 'Gemini API not configured',
                'equation': ''
            }
        
        try:
            # Convert bytes to PIL Image
            image = Image.open(BytesIO(image_bytes))
            
            # Prompt for equation extraction
            prompt = """
            Look at this handwritten math image and extract the mathematical equation or expression.
            
            Instructions:
            1. Extract ONLY the mathematical content
            2. Use standard notation: +, -, *, /, =, ^, sqrt(), etc.
            3. Use 'x', 'y', 'z' for variables
            4. Return ONLY the equation, no explanation
            5. If there are multiple equations, return the main one
            
            Examples of expected output format:
            - 2x + 3 = 7
            - x^2 - 4x + 4 = 0
            - sqrt(16) + 3
            - 5 * (3 + 2)
            
            Extract the equation from this image:
            """
            
            response = self.model.generate_content([prompt, image])
            
            if response.text:
                equation = response.text.strip()
                # Clean up the response
                equation = equation.replace('```', '').replace('math', '').strip()
                
                return {
                    'success': True,
                    'equation': equation,
                    'raw_response': response.text
                }
            else:
                return {
                    'success': False,
                    'error': 'No text extracted',
                    'equation': ''
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'equation': ''
            }
    
    def solve_with_explanation(self, equation):
        """
        Use Gemini to solve equation with detailed explanation
        (Backup solver when SymPy fails)
        """
        if not self.model:
            return None
        
        try:
            prompt = f"""
            Solve this math equation step by step:
            {equation}
            
            Provide:
            1. The solution
            2. Clear step-by-step explanation
            3. Final answer clearly marked
            
            Format your response as:
            STEPS:
            1. [step 1]
            2. [step 2]
            ...
            
            ANSWER: [final answer]
            
            EXPLANATION: [brief explanation of the method used]
            """
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                return {
                    'success': True,
                    'response': response.text
                }
            
        except Exception as e:
            print(f"Gemini solve error: {e}")
        
        return None