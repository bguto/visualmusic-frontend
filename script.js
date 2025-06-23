// URL del backend (sin barra final)
const BACKEND_URL = "https://visualmusic-backend.onrender.com";

// Intentar enviar el enlace a la API
async function enviarYoutubeLink(url, reintento = false) {
    try {
        const resp = await fetch(`${BACKEND_URL}/api/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ youtube_url: url })
        });

        if (!resp.ok) {
            throw new Error(`HTTP error ${resp.status}`);
        }

        const data = await resp.json();
        if (data.error) throw new Error(data.error);

        return data;
    } catch (err) {
        if (!reintento) {
            document.getElementById('error').textContent = 'Backend despertando... intentando de nuevo';
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await enviarYoutubeLink(url, true);
        } else {
            throw err;
        }
    }
}

document.getElementById('generate-btn').onclick = async function() {
    const youtubeUrl = document.getElementById('youtube-input').value;
    document.getElementById('error').textContent = '';
    if (!youtubeUrl) {
        document.getElementById('error').textContent = 'Por favor, pega un enlace de YouTube.';
        return;
    }

    document.getElementById('error').textContent = 'Procesando, esto puede tardar...';

    try {
        const data = await enviarYoutubeLink(youtubeUrl);
        window.notesData = data;
        if (window.redrawVisualization) window.redrawVisualization();
        document.getElementById('error').textContent = '';
    } catch (e) {
        document.getElementById('error').textContent = 'Error: ' + e.message;
    }
};

let colors = {
    "drums": [255, 50, 50, 120],
    "bass": [50, 255, 150, 120],
    "other": [150, 150, 255, 120],
    "unknown": [200, 200, 200, 120]
};

let sketch = function(p) {
    let t = 0;
    p.setup = function() {
        let canvas = p.createCanvas(900, 400);
        canvas.parent('visualization');
        p.frameRate(60);
        p.noLoop();
    };

    p.draw = function() {
        p.background(24, 28, 36, 80);
        if (!window.notesData) return;
        t = p.millis() / 1000.0;
        for (let note of window.notesData) {
            if (t < note.start || t > note.end) continue;
            let c = colors[note.instrument] || colors['unknown'];
            p.fill(...c);
            p.noStroke();
            let x = p.map(note.pitch, 21, 108, 60, 850);
            let y = p.map(note.instrument.charCodeAt(0), 97, 122, 100, 350);
            let sz = 20 + (note.end - note.start) * 40;
            p.ellipse(x, y, sz, sz);
        }
    };

    window.redrawVisualization = () => {
        p.loop();
        setTimeout(() => p.noLoop(), 30000);
    };
};
new p5(sketch);
