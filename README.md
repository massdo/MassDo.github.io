# Portfolio - Dorian Massoulier

Site personnel statique en une page, sans framework, sans build et sans dépendances.

## Structure

- `index.html`: contenu de la page.
- `styles.css`: styles responsive et frise temporelle verticale.
- `script.js`: interactions progressives légères.
- `.nojekyll`: force GitHub Pages à servir les fichiers comme un site statique simple.

## Lancer en local

Avec Python:

```bash
python3 -m http.server 4000
```

Puis ouvrir `http://localhost:4000`.

Avec Node si tu préfères:

```bash
npx serve .
```

Le site peut aussi être ouvert directement dans le navigateur via `index.html`.
