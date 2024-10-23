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
    
    # Initialize extensions
    CORS(app)
    mongo.init_app(app)
    mail.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.contacts import contacts_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(contacts_bp)
    
    return app