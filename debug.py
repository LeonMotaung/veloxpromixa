import sys; sys.path.insert(0, '.')
from velox.runtime import VeloxRuntime
import traceback
import pandas as pd
import numpy as np

source = """
layer Dense (10)
layer Dense (1)
train on test.csv
loss mse
"""

df = pd.DataFrame(np.random.rand(10, 4))
df['target'] = np.random.rand(10)
df.to_csv('test.csv', index=False)

rt = VeloxRuntime(verbose=True)
try:
    rt._pipeline(source, lambda e, l, a: None)
except Exception as e:
    traceback.print_exc()
