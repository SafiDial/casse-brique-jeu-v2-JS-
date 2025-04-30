 //----------- Références des éléments HTML
  const canvas = document.getElementById("canevas");
  const ctx = canvas.getContext("2d");
  const viesElement = document.getElementById("vies");
  const messageElement = document.getElementById("message");
  const boutonDemarrer = document.getElementById("demarrer");

  //-------------- Paramètres du jeu ------------//
  let jeuEnCours = false;
  let animationId;

  //-------------- Balle ------------------------//
  let x, y, dx, dy;
  const rayonBalle = 10;

  //-------------- Raquette ---------------------//
  const largeurRaquette = 75;
  const hauteurRaquette = 10;
  let xRaquette;

  //-------------- Contrôles --------------------//
  let droite = false;
  let gauche = false;

  //--------------- Vies ------------------------//
  let vies = 3;

  //--------------- Briques ----------------------//
  const ligneBriques = 4;
  const colonneBriques = 6;
  const largeurBrique = 65;
  const hauteurBrique = 20;
  const espacement = 10;
  const margeHaut = 30;
  const margeGauche = 30;
  let briques = [];

  //----------------- Événements clavier et bouton --------------------------//
  document.addEventListener("keydown", toucheEnfoncee);
  document.addEventListener("keyup", toucheRelachee);
  boutonDemarrer.addEventListener("click", demarrerJeu);

  //----------------- Créer toutes les briques -------------------------------//
  function initialiserBriques() {
    briques = [];
    for (let c = 0; c < colonneBriques; c++) {
      briques[c] = [];
      for (let l = 0; l < ligneBriques; l++) {
        briques[c][l] = { x: 0, y: 0, visible: true };
      }
    }
  }

  //-------------------------------- Démarrer le jeu ----------------------------//
  function demarrerJeu() {
    jeuEnCours = true;
    boutonDemarrer.style.display = "none"; // pour Masque le bouton "Commencer"
    messageElement.textContent = "";

    vies = 3;
    viesElement.textContent = "Vies : " + vies;

    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3; //** Vitesse initiale de la balle en X
    dy = -3; //** Vitesse initiale de la balle en Y
    xRaquette = (canvas.width - largeurRaquette) / 2;

    initialiserBriques();
    dessiner();
  }

  //----------------- Gestion des touches -----------------------//
  function toucheEnfoncee(e) {
    if (e.key === "ArrowRight") droite = true;
    if (e.key === "ArrowLeft") gauche = true;
  }
  function toucheRelachee(e) {
    if (e.key === "ArrowRight") droite = false;
    if (e.key === "ArrowLeft") gauche = false;
  }

  //----------------- Dessiner la balle avec un joli dégradé ------------------//
  function dessinerBalle() {
    const gradient = ctx.createRadialGradient(x, y, 2, x, y, rayonBalle);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#ffaa00");

    ctx.beginPath();
    ctx.arc(x, y, rayonBalle, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
  }

  //-------------------------- Dessiner la raquette --------------------------//
  function dessinerRaquette() {
    ctx.beginPath();
    ctx.rect(
      xRaquette,
      canvas.height - hauteurRaquette,
      largeurRaquette,
      hauteurRaquette
    );
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
  }

  //-------------------- Dessiner les briques en dégradé jaune-or ----------------------//
  function dessinerBriques() {
    for (let c = 0; c < colonneBriques; c++) {
      for (let l = 0; l < ligneBriques; l++) {
        const brique = briques[c][l];
        if (brique.visible) {
          const briqueX = c * (largeurBrique + espacement) + margeGauche;
          const briqueY = l * (hauteurBrique + espacement) + margeHaut;
          brique.x = briqueX;
          brique.y = briqueY;

          const gradient = ctx.createLinearGradient(
            briqueX,
            briqueY,
            briqueX + largeurBrique,
            briqueY
          );
          gradient.addColorStop(0, "#fff200");
          gradient.addColorStop(1, "#ffae00");

          ctx.beginPath();
          ctx.rect(briqueX, briqueY, largeurBrique, hauteurBrique);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  //----------------------- Détection des collisions avec les briques -------------------//
  function collisionBriques() {
    for (let c = 0; c < colonneBriques; c++) {
      for (let l = 0; l < ligneBriques; l++) {
        const brique = briques[c][l];
        if (brique.visible) {
          if (
            x > brique.x &&
            x < brique.x + largeurBrique &&
            y > brique.y &&
            y < brique.y + hauteurBrique
          ) {
            dy = -dy;

            //** Légère variation aléatoire dans l'angle après chaque collision avec une brique
            dx += (Math.random() - 0.5) * 2; // Ce facteur ajoute un peu de variation dans la direction de la balle.
            brique.visible = false;
          }
        }
      }
    }
  }

  //---------------- Fonction principale de dessin --------------//
  function dessiner() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dessinerBriques();
    dessinerBalle();
    dessinerRaquette();
    collisionBriques();

    //-------------- Rebond sur les murs --------------//
    if (x + dx > canvas.width - rayonBalle || x + dx < rayonBalle) dx = -dx;
    if (y + dy < rayonBalle) dy = -dy;
    else if (y + dy > canvas.height - rayonBalle) {
      if (x > xRaquette && x < xRaquette + largeurRaquette) {
        dy = -dy;

        //-- Légère variation aléatoire dans l'angle après chaque rebond sur la raquette
        dx += (Math.random() - 0.5) * 2; //------- Modification aléatoire de la direction
      } else {
        vies--;
        viesElement.textContent = "Vies : " + vies;
        if (vies === 0) {
          messageElement.textContent = "💥 Perdu !";
          jeuEnCours = false;
          boutonDemarrer.style.display = "block"; //---- Afficher "Recommencer"
          boutonDemarrer.textContent = "🔄 Recommencer"; //------- Modifier le texte
          return;
        } else {
          //----------- Réinitialiser balle/raquette --------------//
          x = canvas.width / 2;
          y = canvas.height - 30;
          dx = 3;
          dy = -3;
          xRaquette = (canvas.width - largeurRaquette) / 2;
        }
      }
    }

    //-------------- Déplacement raquette --------------//
    if (droite && xRaquette < canvas.width - largeurRaquette) xRaquette += 6;
    else if (gauche && xRaquette > 0) xRaquette -= 6;

    //------------- Mise à jour position balle
    x += dx;
    y += dy;

    if (jeuEnCours) animationId = requestAnimationFrame(dessiner);
  }
