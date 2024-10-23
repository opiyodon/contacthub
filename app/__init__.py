from flask import Flask
from flask_pymongo import PyMongo
from flask_mail import Mail
from flask_cors import CORS
from config import Config

mongo = PyMongo()
mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions with CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "Accept"]
        }
    })
    
    # Initialize MongoDB with the URI from config
    app.config["MONGO_URI"] = Config.MONGO_URI
    mongo.init_app(app)
    mail.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.contacts import contacts_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(contacts_bp)
    
    return app