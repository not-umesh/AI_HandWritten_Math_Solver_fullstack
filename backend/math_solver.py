"""
Math Solver - Enhanced with ELI5/ELI10, Impossible Detection, Mistake Hints
"""

import re

# Only import what we need from sympy
from sympy import symbols, sqrt, sin, cos, tan, log, ln, exp, pi, E, Eq, I
from sympy import solve, simplify, oo, zoo, nan, Abs
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor
)

# Common student mistakes patterns
COMMON_MISTAKES = {
    'sqrt_addition': {
        'pattern': r'√\(.*\+.*\)',
        'wrong': '√(a+b) = √a + √b',
        'correct': '√(a+b) ≠ √a + √b. You cannot split square roots over addition.',
        'tip': 'Only √(a×b) = √a × √b works for multiplication!'
    },
    'log_addition': {
        'pattern': r'log\(.*\+.*\)',
        'wrong': 'log(a+b) = log(a) + log(b)',
        'correct': 'log(a×b) = log(a) + log(b), NOT log(a+b)',
        'tip': 'Logarithm addition rule only works for multiplication inside!'
    },
    'forgot_plus_c': {
        'pattern': r'∫|integral',
        'wrong': 'Forgetting +C in indefinite integrals',
        'correct': 'Always add +C (constant of integration) for indefinite integrals',
        'tip': 'The derivative of any constant is 0, so we need +C!'
    },
    'trig_identity': {
        'pattern': r'sin.*cos|cos.*sin',
        'wrong': 'sin²θ + cos²θ = 1 misuse',
        'correct': 'This identity only works for the same angle θ',
        'tip': 'sin²(30°) + cos²(30°) = 1, but sin²(30°) + cos²(45°) ≠ 1'
    },
    'negative_sqrt': {
        'pattern': r'√-|sqrt\(-',
        'wrong': '√(-x) is real for negative x',
        'correct': '√(negative number) is not a real number',
        'tip': 'In real numbers, you cannot take square root of negatives!'
    },
    'zero_division': {
        'pattern': r'/0|÷0',
        'wrong': 'Dividing by zero',
        'correct': 'Division by zero is undefined',
        'tip': 'Before dividing, always check if denominator can be zero!'
    }
}

# Grade-based explanation templates
GRADE8_TEMPLATES = {
    'linear': "Think of {var} as an unknown number. {story}",
    'quadratic': "Imagine a ball thrown in the air - it goes up, then comes down! {story}",
    'arithmetic': "Just like calculating your marks! {story}",
    'default': "Let's break this down step by step: {story}"
}

GRADE10_TEMPLATES = {
    'linear': "We're isolating the variable by doing the same operation on both sides. {story}",
    'quadratic': "Using the quadratic formula or factoring to find the roots. {story}",
    'arithmetic': "Applying order of operations (BODMAS/PEMDAS). {story}",
    'default': "Here's the mathematical approach: {story}"
}

GRADE12_TEMPLATES = {
    'linear': "Solving by algebraic manipulation and verification. {story}",
    'quadratic': "Analyzing discriminant and applying appropriate method. {story}",
    'arithmetic': "Numerical computation with precision. {story}",
    'default': "Mathematical analysis: {story}"
}


class MathSolver:
    def __init__(self):
        self.x, self.y, self.z = symbols('x y z')
        self.transformations = (
            standard_transformations + 
            (implicit_multiplication_application, convert_xor)
        )
        self.local_dict = {
            'x': self.x, 'y': self.y, 'z': self.z,
            'pi': pi, 'e': E, 'sqrt': sqrt,
            'sin': sin, 'cos': cos, 'tan': tan,
            'log': log, 'ln': ln, 'exp': exp,
            'i': I, 'I': I
        }
    
    def solve(self, equation_str, explanation_mode='grade10'):
        """
        Solve equation with enhanced features
        explanation_mode: 'grade8', 'grade10', 'grade12'
        """
        try:
            equation_str = self._preprocess(equation_str)
            
            # Check for impossible/undefined cases first
            impossible = self._check_impossible(equation_str)
            if impossible:
                return impossible
            
            # Detect common mistakes
            mistakes = self._detect_mistakes(equation_str)
            
            if '=' in equation_str:
                result = self._solve_equation(equation_str)
            else:
                result = self._evaluate_expression(equation_str)
            
            # Add mistake warnings
            result['common_mistakes'] = mistakes
            
            # Generate explanation based on mode
            result['explanation'] = self._generate_explanation(
                equation_str, result, explanation_mode
            )
            result['explanation_mode'] = explanation_mode
                
            return result
                
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': [f'Could not solve: {equation_str}'],
                'explanation': 'Please check the equation format.',
                'type': 'error',
                'common_mistakes': [],
                'is_impossible': False
            }
    
    def _check_impossible(self, eq):
        """Check for mathematically impossible cases"""
        eq_lower = eq.lower()
        
        # Check for sin/cos out of range
        if re.search(r'sin\s*\(?\s*x\s*\)?\s*=\s*([2-9]|1\.[1-9])', eq):
            return {
                'answer': 'No real solution',
                'steps': ['sin(x) can only equal values between -1 and 1'],
                'explanation': 'The sine function always returns values in [-1, 1]',
                'type': 'impossible',
                'is_impossible': True,
                'impossible_reason': 'sin(x) = value where |value| > 1 has no real solution',
                'suggestion': 'Did you copy the question correctly? Check if the value is within [-1, 1]',
                'common_mistakes': []
            }
        
        if re.search(r'cos\s*\(?\s*x\s*\)?\s*=\s*([2-9]|1\.[1-9])', eq):
            return {
                'answer': 'No real solution',
                'steps': ['cos(x) can only equal values between -1 and 1'],
                'explanation': 'The cosine function always returns values in [-1, 1]',
                'type': 'impossible',
                'is_impossible': True,
                'impossible_reason': 'cos(x) = value where |value| > 1 has no real solution',
                'suggestion': 'Did you copy the question correctly?',
                'common_mistakes': []
            }
        
        # Check for log of negative
        if re.search(r'log\s*\(\s*-\d+\s*\)|ln\s*\(\s*-\d+\s*\)', eq):
            return {
                'answer': 'Undefined',
                'steps': ['Logarithm of a negative number is undefined in real numbers'],
                'explanation': 'log(x) only works for x > 0',
                'type': 'impossible',
                'is_impossible': True,
                'impossible_reason': 'Logarithm of negative numbers is undefined in real numbers',
                'suggestion': 'Check if the number inside log() is positive',
                'common_mistakes': []
            }
        
        # Check for sqrt of negative
        if re.search(r'sqrt\s*\(\s*-\d+\s*\)|√\s*-\d+', eq):
            return {
                'answer': 'No real solution',
                'steps': ['Square root of a negative number is imaginary, not real'],
                'explanation': '√(-x) gives imaginary numbers (uses i = √-1)',
                'type': 'impossible',
                'is_impossible': True,
                'impossible_reason': 'Square root of negative = imaginary number',
                'suggestion': 'For real solutions, the number under √ must be ≥ 0',
                'common_mistakes': []
            }
        
        return None
    
    def _detect_mistakes(self, eq):
        """Detect common student mistakes"""
        mistakes = []
        
        for key, mistake in COMMON_MISTAKES.items():
            if re.search(mistake['pattern'], eq, re.IGNORECASE):
                mistakes.append({
                    'id': key,
                    'wrong_approach': mistake['wrong'],
                    'correct_approach': mistake['correct'],
                    'tip': mistake['tip']
                })
        
        return mistakes
    
    def _generate_explanation(self, eq, result, mode):
        """Generate explanation based on mode"""
        eq_type = result.get('type', 'default')
        answer = result.get('answer', '')
        
        if mode == 'eli5':
            template = ELI5_TEMPLATES.get(eq_type, ELI5_TEMPLATES['default'])
            var = 'x' if 'x' in eq else 'something'
            
            if eq_type == 'linear':
                story = f"Each box has the same number of toys inside. We found that each box has {answer.split('=')[-1].strip() if '=' in answer else answer} toys!"
            elif eq_type == 'arithmetic':
                story = f"When we count all our toys together, we get {answer}!"
            else:
                story = f"After our adventure, we discovered the answer is {answer}!"
            
            return template.format(var=var, story=story)
        
        elif mode == 'eli10':
            template = ELI10_TEMPLATES.get(eq_type, ELI10_TEMPLATES['default'])
            
            if eq_type == 'linear':
                story = f"If we share equally, each person gets {answer.split('=')[-1].strip() if '=' in answer else answer}."
            elif eq_type == 'quadratic':
                story = f"Like finding when a ball reaches the ground - the answer is {answer}."
            else:
                story = f"Working through the math step by step, we find {answer}."
            
            return template.format(story=story)
        
        else:
            return result.get('explanation', 'Solved successfully.')
    
    def _preprocess(self, eq):
        if not eq:
            return ""
        eq = eq.replace('^', '**')
        eq = eq.replace('×', '*').replace('÷', '/')
        eq = eq.replace('−', '-').replace('—', '-')
        eq = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', eq)
        eq = re.sub(r'\)\(', r')*(', eq)
        eq = re.sub(r'(\d)\(', r'\1*(', eq)
        return eq.strip()
    
    def _solve_equation(self, equation_str):
        steps = []
        try:
            parts = equation_str.split('=')
            if len(parts) != 2:
                raise ValueError("Invalid equation")
            
            left_str, right_str = parts[0].strip(), parts[1].strip()
            steps.append(f"📝 Equation: {left_str} = {right_str}")
            
            left = parse_expr(left_str, transformations=self.transformations, 
                            local_dict=self.local_dict)
            right = parse_expr(right_str, transformations=self.transformations, 
                             local_dict=self.local_dict)
            
            equation = Eq(left, right)
            all_symbols = equation.free_symbols
            
            if not all_symbols:
                is_true = simplify(left - right) == 0
                return {
                    'answer': 'True ✓' if is_true else 'False ✗',
                    'steps': steps,
                    'explanation': 'Verified equation.',
                    'type': 'verification',
                    'is_impossible': False
                }
            
            var = list(all_symbols)[0]
            steps.append(f"🔍 Solving for: {var}")
            steps.append(f"📐 Rearranging equation to isolate {var}")
            
            solutions = solve(equation, var)
            
            # Check for complex solutions only
            real_solutions = [s for s in solutions if not s.has(I)]
            
            if not solutions:
                return {
                    'answer': 'No solution',
                    'steps': steps + ['❌ This equation has no solution'],
                    'explanation': 'No solution exists for this equation.',
                    'type': 'no_solution',
                    'is_impossible': True,
                    'impossible_reason': 'Equation has no solution'
                }
            
            if not real_solutions and solutions:
                # Only complex solutions
                return {
                    'answer': 'No real solution (complex only)',
                    'steps': steps + [f'Complex solutions: {solutions}'],
                    'explanation': 'This equation only has complex/imaginary solutions.',
                    'type': 'complex_only',
                    'is_impossible': True,
                    'impossible_reason': 'Only complex solutions exist (involves √-1)'
                }
            
            for sol in real_solutions:
                steps.append(f"✅ {var} = {simplify(sol)}")
            
            if len(real_solutions) == 1:
                answer = f"{var} = {simplify(real_solutions[0])}"
                eq_type = 'linear'
            else:
                answer = f"{var} = " + " or ".join([str(simplify(s)) for s in real_solutions])
                eq_type = 'quadratic' if len(real_solutions) == 2 else 'polynomial'
            
            return {
                'answer': answer,
                'steps': steps,
                'explanation': f'Solved for {var}.',
                'type': eq_type,
                'is_impossible': False
            }
            
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': steps,
                'explanation': 'Check equation format.',
                'type': 'error',
                'is_impossible': False
            }
    
    def _evaluate_expression(self, expr_str):
        steps = [f"📝 Expression: {expr_str}"]
        try:
            expr = parse_expr(expr_str, transformations=self.transformations,
                            local_dict=self.local_dict)
            
            # Check for undefined results
            if expr.has(zoo) or expr.has(nan) or expr.has(oo):
                return {
                    'answer': 'Undefined',
                    'steps': steps + ['⚠️ This expression is undefined'],
                    'explanation': 'Expression results in undefined value (infinity or NaN)',
                    'type': 'impossible',
                    'is_impossible': True,
                    'impossible_reason': 'Expression is undefined'
                }
            
            if expr.free_symbols:
                simplified = simplify(expr)
                steps.append(f"📐 Simplified: {simplified}")
                return {
                    'answer': str(simplified),
                    'steps': steps,
                    'explanation': 'Simplified expression.',
                    'type': 'algebraic',
                    'is_impossible': False
                }
            else:
                result = expr.evalf()
                if result == int(result):
                    result = int(result)
                else:
                    result = round(float(result), 6)
                steps.append(f"🔢 Result: {result}")
                return {
                    'answer': str(result),
                    'steps': steps,
                    'explanation': 'Calculated result.',
                    'type': 'arithmetic',
                    'is_impossible': False
                }
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': steps,
                'explanation': 'Check expression.',
                'type': 'error',
                'is_impossible': False
            }