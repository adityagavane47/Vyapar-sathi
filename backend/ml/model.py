import numpy as np
import json

class MLPClassifier:
    def __init__(self, weights=None):
        # Neural Network architecture: 8 -> 16 -> 1
        self.input_dim = 8
        self.hidden_dim = 16
        self.output_dim = 1

        if weights is not None:
            self.set_weights(weights)
        else:
            self.init_weights()

    def init_weights(self):
        # He initialization for hidden layer, Xavier for output layer
        self.W1 = np.random.randn(self.input_dim, self.hidden_dim) * np.sqrt(2.0 / self.input_dim)
        self.b1 = np.zeros(self.hidden_dim)
        self.W2 = np.random.randn(self.hidden_dim, self.output_dim) * np.sqrt(1.0 / self.hidden_dim)
        self.b2 = np.zeros(self.output_dim)

    def relu(self, x):
        return np.maximum(0, x)

    def sigmoid(self, x):
        # Stable sigmoid
        return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))

    def forward(self, X):
        """
        X: shape (N, 8)
        Returns:
            A1: hidden layer activations, shape (N, 16)
            A2: output probabilities, shape (N, 1)
        """
        Z1 = np.dot(X, self.W1) + self.b1
        A1 = self.relu(Z1)
        Z2 = np.dot(A1, self.W2) + self.b2
        A2 = self.sigmoid(Z2)
        return A1, A2

    def backward(self, X, y, A1, A2):
        """
        Computes gradients.
        X: (N, 8)
        y: (N, 1) or (N,)
        A1: (N, 16)
        A2: (N, 1)
        """
        N = X.shape[0]
        y = y.reshape(-1, 1)

        # Backpropagation
        dZ2 = A2 - y # derivative of BCE loss + sigmoid
        dW2 = np.dot(A1.T, dZ2) / N
        db2 = np.sum(dZ2, axis=0) / N

        dA1 = np.dot(dZ2, self.W2.T)
        dZ1 = dA1 * (A1 > 0) # ReLU derivative
        dW1 = np.dot(X.T, dZ1) / N
        db1 = np.sum(dZ1, axis=0) / N

        return dW1, db1, dW2, db2

    def train_epoch(self, X, y, lr=0.05):
        """
        Trains for one epoch on the dataset.
        """
        X = np.array(X)
        y = np.array(y)
        A1, A2 = self.forward(X)
        dW1, db1, dW2, db2 = self.backward(X, y, A1, A2)

        # Gradient descent step
        self.W1 -= lr * dW1
        self.b1 -= lr * db1
        self.W2 -= lr * dW2
        self.b2 -= lr * db2

    def train(self, X, y, epochs=10, lr=0.05):
        """
        Trains model on local data.
        """
        for _ in range(epochs):
            self.train_epoch(X, y, lr)

    def predict_proba(self, X):
        X = np.array(X)
        if len(X.shape) == 1:
            X = X.reshape(1, -1)
        _, A2 = self.forward(X)
        return A2.flatten()

    def predict(self, X, threshold=0.5):
        probs = self.predict_proba(X)
        return (probs >= threshold).astype(int)

    def evaluate(self, X, y, threshold=0.5):
        """
        Evaluates predictions. Returns metrics dict.
        """
        X = np.array(X)
        y = np.array(y).flatten()
        if len(X) == 0:
            return {"accuracy": 0.0, "precision": 0.0, "recall": 0.0, "f1": 0.0}

        y_pred = self.predict(X, threshold)

        tp = np.sum((y == 1) & (y_pred == 1))
        tn = np.sum((y == 0) & (y_pred == 0))
        fp = np.sum((y == 0) & (y_pred == 1))
        fn = np.sum((y == 1) & (y_pred == 0))

        accuracy = (tp + tn) / len(y)
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

        return {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1": float(f1),
            "tp": int(tp),
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn)
        }

    def get_weights(self):
        """
        Returns model weights as JSON-serializable list dict.
        """
        return {
            "W1": self.W1.tolist(),
            "b1": self.b1.tolist(),
            "W2": self.W2.tolist(),
            "b2": self.b2.tolist()
        }

    def set_weights(self, weights_dict):
        """
        Loads weights from dict.
        """
        self.W1 = np.array(weights_dict["W1"])
        self.b1 = np.array(weights_dict["b1"])
        self.W2 = np.array(weights_dict["W2"])
        self.b2 = np.array(weights_dict["b2"])
