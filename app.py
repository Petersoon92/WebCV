from flask import Flask, render_template, send_from_directory, jsonify
import os

app = Flask(__name__)

IMAGES_FOLDER = os.path.join(app.static_folder, 'images')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/images')
def get_images():
    """Vrátí seznam všech obrázků ve složce images."""
    if not os.path.exists(IMAGES_FOLDER):
        return jsonify([])

    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
    excluded_files = {'tablet-frame.png'}
    images = []

    for filename in sorted(os.listdir(IMAGES_FOLDER)):
        if filename in excluded_files:
            continue
        ext = os.path.splitext(filename)[1].lower()
        if ext in allowed_extensions:
            images.append(filename)

    return jsonify(images)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5999))
    app.run(host='0.0.0.0', port=port)
