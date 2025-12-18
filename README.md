# About the Universe – Holocron Galactique

Projet front statique pour explorer l’univers Star Wars via l’API publique SWAPI. Il propose une page d’accueil “Holocron Galactique” et des pages dédiées pour les planètes, véhicules et personnages.

## Fonctionnalités
- Récupération live des données SWAPI (planètes, véhicules, personnes).
- Tableau des planètes avec filtrage par tranches de population et recherche (nom/terrain/climat) + compteur dynamique.
- Détails de la planète sélectionnée (population, diamètre, gravité, climat, terrain).
- Navigation latérale et top-bar cohérentes sur toutes les pages.

## Structure
- `index.html` : page d’accueil et tuiles de données live.
- `planetes.html` : liste filtrable/recherchable des planètes + panneau de détails.
- `vehicules.html` : liste des véhicules.
- `personnes.html` : liste des personnages.
- `api.js` : configuration des endpoints SWAPI.
- `planets.js` : logique d’affichage/filtrage des planètes.
- `dom.js`, `utile.js`, `nav.js` : utilitaires DOM, formatage, navigation.
- `style.css` : styles globaux et composants.

## Démarrage rapide
1. Cloner ou récupérer le dossier `about-the-univers`.
2. Naviguer vers `planetes.html`, `vehicules.html` ou `personnes.html` pour explorer les données.

## Notes techniques
- Aucune build tool : HTML/CSS/JS vanilla.
- Les valeurs inconnues sont normalisées en `NC` via `utile.js`.
- Les scripts sont inclus en bas des pages pour charger après le DOM.
