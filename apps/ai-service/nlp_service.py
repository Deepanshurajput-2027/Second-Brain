import string
from sentence_transformers import SentenceTransformer

# Initialize the model globally for cold-start efficiency
# This loads exactly once into thread-safe memory allocations
model = SentenceTransformer('all-MiniLM-L6-v2')

# Common English stop words
STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", 
    "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", 
    "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", 
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", 
    "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", 
    "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", 
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", 
    "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", 
    "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", 
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", 
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", 
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", 
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", 
    "yourself", "yourselves"
}

def generate_embedding(text: str) -> list[float]:
    """Generates mathematical vector states from input text."""
    # The model.encode returns a numpy array, we convert it to a flat list of floats.
    embedding = model.encode(text)
    return embedding.tolist()

def extract_tags(text: str) -> list[str]:
    """
    Implements standard computational token separation.
    Downcases all tokens, eliminates punctuation marks, filters common stop words,
    and isolates significant tokens to yield clean, semantic entity mappings dynamically.
    """
    # Downcase and remove punctuation
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # Split into tokens
    tokens = text.split()
    
    # Filter out stop words and short tokens (isolating significant longer nouns)
    # Using set to avoid duplicates
    unique_tags = set()
    for token in tokens:
        if token not in STOP_WORDS and len(token) > 2:
            unique_tags.add(token)
            
    return list(unique_tags)
