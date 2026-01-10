"""
Math Solver - SymPy based (Memory Optimized)
"""

import re

# Only import what we need from sympy
from sympy import symbols, sqrt, sin, cos, tan, log, ln, exp, pi, E, Eq
from sympy import solve, simplify
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor
)

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
            'log': log, 'ln': ln, 'exp': exp
        }
    
    def solve(self, equation_str):
        try:
            equation_str = self._preprocess(equation_str)
            
            if '=' in equation_str:
                return self._solve_equation(equation_str)
            else:
                return self._evaluate_expression(equation_str)
                
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': [f'Could not solve: {equation_str}'],
                'explanation': 'Please check the equation format.',
                'type': 'error'
            }
    
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
                    'type': 'verification'
                }
            
            var = list(all_symbols)[0]
            steps.append(f"🔍 Solving for: {var}")
            
            solutions = solve(equation, var)
            
            if not solutions:
                return {
                    'answer': 'No solution',
                    'steps': steps,
                    'explanation': 'No real solution exists.',
                    'type': 'no_solution'
                }
            
            for sol in solutions:
                steps.append(f"✅ {var} = {simplify(sol)}")
            
            if len(solutions) == 1:
                answer = f"{var} = {simplify(solutions[0])}"
            else:
                answer = f"{var} = " + " or ".join([str(simplify(s)) for s in solutions])
            
            return {
                'answer': answer,
                'steps': steps,
                'explanation': f'Solved for {var}.',
                'type': 'linear' if len(solutions) == 1 else 'polynomial'
            }
            
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': steps,
                'explanation': 'Check equation format.',
                'type': 'error'
            }
    
    def _evaluate_expression(self, expr_str):
        steps = [f"📝 Expression: {expr_str}"]
        try:
            expr = parse_expr(expr_str, transformations=self.transformations,
                            local_dict=self.local_dict)
            
            if expr.free_symbols:
                simplified = simplify(expr)
                steps.append(f"📐 Simplified: {simplified}")
                return {
                    'answer': str(simplified),
                    'steps': steps,
                    'explanation': 'Simplified expression.',
                    'type': 'algebraic'
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
                    'type': 'arithmetic'
                }
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': steps,
                'explanation': 'Check expression.',
                'type': 'error'
            }