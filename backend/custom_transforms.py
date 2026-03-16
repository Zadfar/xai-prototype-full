import numpy as np
import pandas as pd
from typing import Any

def log_income(X: Any) -> Any:
    """
    Applies log transformation (log(1+x)) to the person_income feature.
    Safely handles pandas DataFrames.
    """
    if isinstance(X, pd.DataFrame):
        X_copy = X.copy()
        if "person_income" in X_copy.columns:
            # np.log1p is safe for zero incomes
            X_copy["person_income"] = np.log1p(X_copy["person_income"].astype(float))
        return X_copy
    
    # Return as-is if not a DataFrame (e.g., already converted to numpy array)
    return X