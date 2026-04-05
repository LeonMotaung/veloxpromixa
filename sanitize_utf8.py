import os

MAP = {
    "\u2192": "->",
    "\u2014": "-",
    "\u2013": "-",
    "\u2713": "OK",
    "\u2717": "FAIL",
    "\u26a0": "[WARN]",
    "\u26a1": "[!]",
    "\u2550": "=",
    "\u2551": "|",
    "\u2554": "+",
    "\u2557": "+",
    "\u255a": "+",
    "\u255d": "+",
    "\u2500": "-",
    "\u2502": "|",
    "\u250c": "+",
    "\u2510": "+",
    "\u2514": "+",
    "\u2518": "+",
    "\u25ac": "=",
    "\u2190": "<-",
}

def fix_file(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content = content
    for k, v in MAP.items():
        new_content = new_content.replace(k, v)
    
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed: {path}")

for root, dirs, files in os.walk("velox"):
    for f in files:
        if f.endswith(".py"):
            fix_file(os.path.join(root, f))
