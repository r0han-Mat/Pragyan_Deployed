
import tensorflow as tf
print(f"TF Version: {tf.__version__}")
try:
    print(f"tf.keras: {tf.keras}")
except AttributeError as e:
    print(f"Error accessing tf.keras: {e}")

try:
    from tensorflow import keras
    print("from tensorflow import keras WORKS")
except ImportError as e:
    print(f"from tensorflow import keras FAILED: {e}")
