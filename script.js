// URL del backend (sin barra final)
const BACKEND_URL = "https://visualmusic-backend.onrender.com";

// Intentar enviar el enlace a la API con reintentos múltiples
async function enviarYoutubeLink(url, intento = 1) {
    try {
        const resp = await fetch(\`\${BACKEND_URL}/api/process\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ youtube_url: url })
        });

        if (!resp.ok) throw new Error(\`HTTP error \${resp.status}\`);

        const data = await resp.json();
        if (data.error) throw new Error(data.error);

        return data;
    } catch (err) {
        if (intento < 5) {
            document.getElementById('error').textContent = \`Intento \${intento}/5: esperando al backend...\`;
            await new Promise(resolve => setTimeout(resolve, 5000));
            return await enviarYoutubeLink(url, intento + 1);
        } else {
            throw err;
        }
    }
}

document.getElementById('generate-btn').onclick = async function () {
    const youtubeUrl = document.getElementById('youtube-input').value;
    document.getElementById('error').textContent = '';
    if (!youtubeUrl) {
        document.getElementById('error').textContent = 'Por favor, pega un enlace de YouTube.';
        return;
    }

    document.getElementById('error').textContent = 'Procesando...';
    try {
        const data = await enviarYoutubeLink(youtubeUrl);
        window.notesData = data;
        if (window.redrawVisualization) window.redrawVisualization();
        document.getElementById('error').textContent = '';
    } catch (e) {
        document.getElementById('error').textContent = 'Error final: ' + e.message;
    }
};

let colors = {
    "drums": [255, 100, 100],
    "bass": [100, 255, 150],
    "other": [150, 150, 255],
    "unknown": [200, 200, 200]
};

let sketch = function (p) {
    let t = 0;
    p.setup = function () {
        let canvas = p.createCanvas(900, 400);
        canvas.parent('visualization');
        p.noFill();
        p.frameRate(60);
        p.noLoop();
    };

    p.draw = function () {
        p.background(18, 20, 30, 100);
        if (!window.notesData) return;

        t = p.millis() / 1000.0;
        const offset = t * 100;

        for (let note of window.notesData) {
            if (t < note.start || t > note.end) continue;

            let col = colors[note.instrument] || colors['unknown'];
            p.stroke(col[0], col[1], col[2], 150);
            p.strokeWeight(1.5);

            let waveY = p.map(note.pitch, 21, 108, p.height - 100, 100);
            let amplitude = (note.end - note.start) * 60;
            let xStart = p.map(note.start, 0, 30, 0, p.width);
            let xEnd = p.map(note.end, 0, 30, 0, p.width);

            p.beginShape();
            for (let x = xStart; x <= xEnd; x += 10) {
                let y = waveY + p.sin(x * 0.05 + offset) * amplitude;
                p.curveVertex(x, y);
            }
            p.endShape();
        }
    };

    window.redrawVisualization = () => {
        p.loop();
        setTimeout(() => p.noLoop(), 30000);
    };
};

new p5(sketch);
