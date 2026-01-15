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
    
    def solve(self, equation_str, explanation_mode='standard'):
        """
        Solve equation with enhanced features
        explanation_mode: 'standard' (legacy argument, now ignored/optional)
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
            
            # Generate explanation
            result['explanation'] = self._generate_explanation(
                equation_str, result, explanation_mode
            )
            result['explanation_mode'] = 'standard'
                
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
    
    def _generate_explanation(self, eq, result, mode='standard'):
        """Generate a standard explanation"""
        eq_type = result.get('type', 'default')
        answer = result.get('answer', '')
        
        # Standard templates based on equation type
        if eq_type == 'linear':
            return f"To solve this linear equation, we isolate the variable by performing the same operations on both sides until we get the final answer: {answer}."
        elif eq_type == 'quadratic':
            return f"This is a quadratic equation. We can solve it using the quadratic formula or factoring to find the roots: {answer}."
        elif eq_type == 'arithmetic':
            return f"By following the order of operations (PEMDAS/BODMAS), we calculate the expression to get: {answer}."
        elif eq_type == 'verification':
             return "We evaluate both sides of the equation to check if they are equal."
        else:
            return result.get('explanation', f'Solution: {answer}')
    
    def _preprocess(self, eq):
        if not eq:
            return ""
        
        # Normalize Unicode superscripts - handle sequences like x³ or x²
        superscripts = {
            '⁰': '**0', '¹': '**1', '²': '**2', '³': '**3', '⁴': '**4',
            '⁵': '**5', '⁶': '**6', '⁷': '**7', '⁸': '**8', '⁹': '**9'
        }
        for char, replacement in superscripts.items():
            eq = eq.replace(char, replacement)
        
        # Handle multiple consecutive superscripts (e.g., ²³ -> **23)
        # Fix cases like **2**3 -> **23
        eq = re.sub(r'\*\*(\d)\*\*(\d)', r'**\1\2', eq)
        
        # Standard replacements
        eq = eq.replace('^', '**')
        eq = eq.replace('×', '*').replace('÷', '/')
        eq = eq.replace('−', '-').replace('—', '-')
        
        # Add implicit multiplication: 2x -> 2*x
        eq = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', eq)
        # )( -> )*(
        eq = re.sub(r'\)\(', r')*(', eq)
        # 2( -> 2*(
        eq = re.sub(r'(\d)\(', r'\1*(', eq)
        # x( -> x*(  for variable followed by parenthesis
        eq = re.sub(r'([a-zA-Z])\(', r'\1*(', eq)
        # )x -> )*x for closing paren followed by variable
        eq = re.sub(r'\)([a-zA-Z])', r')*\1', eq)
        
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
                # Keep simplified solution for final answer check
                pass
            
            # --- Try Detailed Step Generation ---
            detailed_steps = []
            
            # Linear Equation Check: ax + b = c
            if len(real_solutions) == 1 and not equation.has(I):
                try:
                    detailed_steps = self._solve_linear_steps(left, right, var)
                except Exception as e:
                    print(f"Linear step generation failed: {e}")
            
            # Quadratic Equation Check: ax^2 + bx + c = 0
            # Check if degree is 2
            try:
                poly = (left - right).as_poly(var)
                if poly and poly.degree() == 2:
                    detailed_steps = self._solve_quadratic_steps(left, right, var)
            except Exception as e:
                print(f"Quadratic step generation failed: {e}")
            
            # Use detailed steps if available, otherwise fallback to simple steps
            if detailed_steps:
                steps = detailed_steps
            else:
                # Fallback to simple verification steps
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

    def _solve_linear_steps(self, left, right, var):
        """Generate detailed educational steps for linear equation: ax + b = cx + d"""
        steps = []
        step_num = 1
        
        # Store original expressions for display
        original_left = left
        original_right = right
        
        steps.append(f"📝 Equation: {original_left} = {original_right}")
        steps.append("")  # blank line for spacing
        
        # 1. Move variable terms to left if variable exists on right
        right_poly = right.as_poly(var)
        if right_poly and right_poly.degree() >= 1:
            coeff_val = right.coeff(var)
            term_to_move = coeff_val * var
            
            if term_to_move != 0:
                # Determine operation text
                if coeff_val > 0:
                    op_text = f"subtracting {simplify(term_to_move)}"
                else:
                    op_text = f"adding {simplify(-term_to_move)}"
                
                steps.append(f"Step {step_num}: Move variable terms to one side by {op_text} from both sides")
                steps.append(f"   {left} - ({simplify(term_to_move)}) = {right} - ({simplify(term_to_move)})")
                
                left = simplify(left - term_to_move)
                right = simplify(right - term_to_move)
                
                steps.append(f"   {left} = {right}")
                steps.append("")
                step_num += 1

        # 2. Move constant terms to right
        left_poly = left.as_poly(var)
        if left_poly:
            l_coeffs = left_poly.all_coeffs()
            if len(l_coeffs) == 2:  # ax + b form
                constant = l_coeffs[1]
                if constant != 0:
                    # Determine operation text
                    if constant > 0:
                        op_text = f"subtracting {simplify(constant)}"
                    else:
                        op_text = f"adding {simplify(-constant)}"
                    
                    steps.append(f"Step {step_num}: Move constant terms to the other side by {op_text} from both sides")
                    steps.append(f"   {left} - ({simplify(constant)}) = {right} - ({simplify(constant)})")
                    
                    left = simplify(left - constant)
                    right = simplify(right - constant)
                    
                    steps.append(f"   {left} = {right}")
                    steps.append("")
                    step_num += 1
        
        # 3. Divide by coefficient to isolate variable
        left_poly = left.as_poly(var)
        if left_poly:
            l_coeffs = left_poly.all_coeffs()
            if len(l_coeffs) > 0:
                coeff = l_coeffs[0]
                if coeff != 1 and coeff != 0:
                    steps.append(f"Step {step_num}: Isolate {var} by dividing both sides by {coeff}")
                    steps.append(f"   {left}/{coeff} = {right}/{coeff}")
                    
                    right = simplify(right / coeff)
                    
                    steps.append(f"   {var} = {right}")
                    steps.append("")
                    step_num += 1
        
        # Final answer
        final_answer = simplify(right)
        steps.append(f"✅ Final Solution: {var} = {final_answer}")
        
        # Verification step (optional but helpful)
        steps.append("")
        steps.append(f"🔍 Verify: Substitute {var} = {final_answer} back into original equation:")
        left_check = simplify(original_left.subs(var, final_answer))
        right_check = simplify(original_right.subs(var, final_answer))
        steps.append(f"   Left side: {original_left} → {left_check}")
        steps.append(f"   Right side: {original_right} → {right_check}")
        if left_check == right_check:
            steps.append(f"   ✓ Both sides equal {left_check}, solution verified!")
        
        return steps

    def _solve_quadratic_steps(self, left, right, var):
        """Generate detailed steps for quadratic equation: ax^2 + bx + c = 0"""
        steps = []
        steps.append(f"🔍 This is a quadratic equation in the form ax² + bx + c = 0")
        
        # Move everything to left side
        eq_zero = simplify(left - right)
        steps.append(f"1️⃣ Standard Form: {eq_zero} = 0")
        
        poly = eq_zero.as_poly(var)
        if not poly: return steps
        
        coeffs = poly.all_coeffs()
        if len(coeffs) != 3: return steps
        
        a, b, c = coeffs[0], coeffs[1], coeffs[2]
        
        steps.append(f"2️⃣ Identify Coefficients:\n   a = {a}, b = {b}, c = {c}")
        
        # Discriminant
        disc = b**2 - 4*a*c
        steps.append(f"3️⃣ Calculate Discriminant (Δ):\n   Δ = b² - 4ac")
        steps.append(f"   Δ = ({b})² - 4({a})({c})")
        steps.append(f"   Δ = {disc}")
        
        if disc > 0:
            steps.append(f"   Since Δ > 0, there are 2 real solutions.")
        elif disc == 0:
            steps.append(f"   Since Δ = 0, there is 1 real solution.")
        else:
            steps.append(f"   Since Δ < 0, solutions are complex (imaginary).")
            
        steps.append(f"4️⃣ Quadratic Formula:")
        steps.append(f"   x = (-b ± √Δ) / 2a")
        
        x1 = (-b + sqrt(disc)) / (2*a)
        x2 = (-b - sqrt(disc)) / (2*a)
        
        steps.append(f"   x = ({-b} ± √{disc}) / {2*a}")
        
        if disc >= 0:
            sqrt_disc = sqrt(disc)
            if sqrt_disc == int(sqrt_disc):
                # Perfect square, show simplified math
                steps.append(f"   x = ({-b} ± {int(sqrt_disc)}) / {2*a}")
        
        return steps
    
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