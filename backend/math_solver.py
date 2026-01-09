"""
Math Solver - SymPy based equation solver with step-by-step solutions
"""

from sympy import (
    sympify, solve, simplify, expand, factor,
    symbols, sqrt, sin, cos, tan, log, ln, exp, pi, E,
    Eq, latex, pretty, Rational, Integer,
    diff, integrate, limit, series, oo,
    trigsimp, radsimp, nsimplify
)
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application,
    convert_xor
)
import re

class MathSolver:
    def __init__(self):
        # Define common symbols
        self.x, self.y, self.z = symbols('x y z')
        self.a, self.b, self.c = symbols('a b c')
        
        # Parser transformations
        self.transformations = (
            standard_transformations + 
            (implicit_multiplication_application, convert_xor)
        )
        
        # Local dictionary for parsing
        self.local_dict = {
            'x': self.x, 'y': self.y, 'z': self.z,
            'a': self.a, 'b': self.b, 'c': self.c,
            'pi': pi, 'e': E, 'E': E,
            'sqrt': sqrt, 'sin': sin, 'cos': cos, 'tan': tan,
            'log': log, 'ln': ln, 'exp': exp
        }
    
    def solve(self, equation_str):
        """
        Main solving function - returns solution with steps
        """
        try:
            # Clean the equation
            equation_str = self._preprocess(equation_str)
            
            # Determine equation type and solve accordingly
            if '=' in equation_str:
                return self._solve_equation(equation_str)
            else:
                return self._evaluate_expression(equation_str)
                
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': [f'Could not solve: {equation_str}'],
                'explanation': 'Please check if the equation is written correctly.',
                'type': 'error'
            }
    
    def _preprocess(self, eq):
        """Preprocess equation string"""
        # Replace common notations
        eq = eq.replace('^', '**')
        eq = eq.replace('×', '*')
        eq = eq.replace('÷', '/')
        eq = eq.replace('−', '-')
        
        # Handle implicit multiplication
        eq = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', eq)
        eq = re.sub(r'([a-zA-Z])(\d)', r'\1*\2', eq)
        eq = re.sub(r'\)\(', r')*(', eq)
        eq = re.sub(r'(\d)\(', r'\1*(', eq)
        eq = re.sub(r'\)(\d)', r')*\1', eq)
        
        return eq.strip()
    
    def _solve_equation(self, equation_str):
        """Solve an equation with = sign"""
        steps = []
        explanation_parts = []
        
        try:
            # Split equation
            parts = equation_str.split('=')
            if len(parts) != 2:
                raise ValueError("Invalid equation format")
            
            left_str, right_str = parts[0].strip(), parts[1].strip()
            
            steps.append(f"📝 Original equation: {left_str} = {right_str}")
            explanation_parts.append("We start with the given equation.")
            
            # Parse both sides
            left = parse_expr(left_str, transformations=self.transformations, 
                            local_dict=self.local_dict)
            right = parse_expr(right_str, transformations=self.transformations, 
                             local_dict=self.local_dict)
            
            # Create equation
            equation = Eq(left, right)
            
            # Find variables
            all_symbols = equation.free_symbols
            
            if not all_symbols:
                # No variables - check if equation is true
                is_true = simplify(left - right) == 0
                return {
                    'answer': 'True ✓' if is_true else 'False ✗',
                    'steps': [f"Checking: {left} = {right}", 
                             f"Result: {'Equation is TRUE' if is_true else 'Equation is FALSE'}"],
                    'explanation': 'This is a numerical equation with no variables. We verify if both sides are equal.',
                    'type': 'verification'
                }
            
            # Solve for the variable
            var = list(all_symbols)[0]
            steps.append(f"🔍 Solving for variable: {var}")
            explanation_parts.append(f"We need to isolate {var} on one side.")
            
            # Move all terms to left side
            combined = left - right
            steps.append(f"📊 Rearranging: {combined} = 0")
            explanation_parts.append("Move all terms to the left side of the equation.")
            
            # Simplify
            simplified = simplify(combined)
            if simplified != combined:
                steps.append(f"📐 Simplified: {simplified} = 0")
                explanation_parts.append("Simplify the expression.")
            
            # Check equation type
            eq_type = self._determine_equation_type(simplified, var)
            
            # Add type-specific steps
            if eq_type == 'linear':
                steps.append("📚 This is a LINEAR equation (degree 1)")
                explanation_parts.append("Linear equations have the variable raised to power 1.")
            elif eq_type == 'quadratic':
                steps.append("📚 This is a QUADRATIC equation (degree 2)")
                explanation_parts.append("Quadratic equations can be solved using the quadratic formula or factoring.")
            
            # Solve
            solutions = solve(equation, var)
            
            # Format solutions
            if not solutions:
                return {
                    'answer': 'No solution exists',
                    'steps': steps + ['❌ No real solution found'],
                    'explanation': ' '.join(explanation_parts) + ' This equation has no real solutions.',
                    'type': eq_type
                }
            
            # Add solution steps
            steps.append("✅ Solution(s):")
            for i, sol in enumerate(solutions, 1):
                simplified_sol = simplify(sol)
                steps.append(f"   {var} = {simplified_sol}")
                
                # Verify solution
                verification = simplify(left.subs(var, sol) - right.subs(var, sol))
                if verification == 0:
                    steps.append(f"   ✓ Verified: Substituting back gives a true equation")
            
            # Format final answer
            if len(solutions) == 1:
                answer = f"{var} = {simplify(solutions[0])}"
            else:
                answer = f"{var} = " + " or ".join([str(simplify(s)) for s in solutions])
            
            return {
                'answer': answer,
                'steps': steps,
                'explanation': ' '.join(explanation_parts) + f" The solution is {answer}.",
                'type': eq_type
            }
            
        except Exception as e:
            return {
                'answer': f'Error solving equation: {str(e)}',
                'steps': steps + [f'⚠️ Error: {str(e)}'],
                'explanation': 'There was an error processing this equation. Please check the format.',
                'type': 'error'
            }
    
    def _evaluate_expression(self, expr_str):
        """Evaluate a mathematical expression"""
        steps = []
        
        try:
            steps.append(f"📝 Expression: {expr_str}")
            
            # Parse expression
            expr = parse_expr(expr_str, transformations=self.transformations,
                            local_dict=self.local_dict)
            
            steps.append(f"📊 Parsed as: {expr}")
            
            # If it has variables, simplify
            if expr.free_symbols:
                simplified = simplify(expr)
                expanded = expand(expr)
                factored = factor(expr)
                
                steps.append("🔧 Simplification:")
                steps.append(f"   Simplified: {simplified}")
                
                if expanded != simplified:
                    steps.append(f"   Expanded: {expanded}")
                if factored != simplified and factored != expanded:
                    steps.append(f"   Factored: {factored}")
                
                return {
                    'answer': str(simplified),
                    'steps': steps,
                    'explanation': f"The expression {expr_str} simplifies to {simplified}.",
                    'type': 'algebraic_expression'
                }
            else:
                # Numerical expression - evaluate
                result = expr.evalf()
                
                # Check if it's a whole number
                if result == int(result):
                    result = int(result)
                else:
                    result = round(float(result), 6)
                
                steps.append(f"🔢 Calculating: {expr}")
                steps.append(f"✅ Result: {result}")
                
                return {
                    'answer': str(result),
                    'steps': steps,
                    'explanation': f"The expression {expr_str} evaluates to {result}.",
                    'type': 'arithmetic'
                }
                
        except Exception as e:
            return {
                'answer': f'Error: {str(e)}',
                'steps': [f'Could not evaluate: {expr_str}'],
                'explanation': 'Please check if the expression is valid.',
                'type': 'error'
            }
    
    def _determine_equation_type(self, expr, var):
        """Determine the type of equation"""
        try:
            from sympy import degree
            deg = degree(expr, var)
            
            if deg == 1:
                return 'linear'
            elif deg == 2:
                return 'quadratic'
            elif deg == 3:
                return 'cubic'
            elif deg > 3:
                return 'polynomial'
            else:
                return 'algebraic'
        except:
            return 'algebraic'