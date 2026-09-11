(() => {
  const supported = ["en", "fr"];
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("lang") || localStorage.getItem("miracleFundLanguage") || "en";
  const language = supported.includes(requested) ? requested : "en";
  const source = document.querySelector("#french-translation-source");

  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  localStorage.setItem("miracleFundLanguage", language);

  const setHTML = (selector, html) => {
    const element = document.querySelector(selector);
    if (element && html) element.innerHTML = html;
  };

  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };

  const switchLanguage = nextLanguage => {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLanguage);
    localStorage.setItem("miracleFundLanguage", nextLanguage);
    window.location.assign(url.href);
  };

  document.querySelectorAll("button[data-language]").forEach(button => {
    const active = button.dataset.language === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.addEventListener("click", () => switchLanguage(button.dataset.language));
  });

  if (language === "fr" && source) {
    document.title = "Aidez-nous à protéger notre foyer | With the Cats";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "Aidez Gemma, Sascha et leurs 27 chats à protéger leur foyer, retrouver la stabilité et garder leur famille unie.");

    setHTML(".site-header nav", '<a href="#story">Notre actualité</a><a href="#ways">Comment aider</a><a href="#transparency">Transparence</a><a href="#contact">Contact</a>');
    setText(".site-header .js-share", "Partager notre histoire");
    setHTML(".bilingual-notice .shell > p", "<strong>Choisissez votre langue.</strong> L’histoire reste au même endroit et la mise en page ne change pas.");

    setHTML(".hero-copy", '<p class="eyebrow">Des nouvelles de notre famille · 8 septembre 2026</p><h1 id="campaign-title">Nous sommes toujours ici, toujours ensemble, et nous nous battons pour protéger notre foyer.</h1><p class="hero-lede">Merci, du fond du cœur, pour votre soutien. Il a une valeur immense pour nous.</p><p>Nous sommes toujours dans notre maison avec nos 27 chats. Nous avons choisi de nous battre pour le lieu qui protège notre famille et nous permet de rester unis, tout en reconstruisant le revenu stable dont nous avons besoin.</p><div class="hero-video-actions"><button class="button button-primary js-donate" type="button">Aider notre famille</button></div><p class="organizer-byline">Campagne organisée par <strong>Gemma Serenity Gorokhoff</strong><br>Maricopa, Arizona</p>');
    setHTML(".hero .donation-card", '<p class="section-label">Notre priorité immédiate</p><h2>Protéger le foyer dont dépend notre famille</h2><p>Votre soutien nous aide à remettre l’hypothèque à jour, prendre soin de nos chats, couvrir les nécessités quotidiennes et retrouver un revenu stable.</p><p class="sidebar-milestone"><span>Notre objectif immédiat</span><strong>25 000 $</strong><small>Environ 20 000 $ pour remettre l’hypothèque à jour, plus 5 000 $ pour nos factures urgentes les plus en retard. Le montant hypothécaire exact n’est pas encore connu.</small></p><button class="button button-primary button-wide js-donate" type="button">Donner maintenant</button><button class="other-giving-button js-donate" type="button">Aider autrement</button>');

    const children = [...source.children];
    const healthIndex = children.findIndex(el => el.tagName === "H3" && el.textContent.includes("La santé"));
    const futureIndex = children.findIndex(el => el.tagName === "H3" && el.textContent.includes("reconstruisons"));
    const quoteIndex = children.findIndex(el => el.tagName === "BLOCKQUOTE");
    const helpIndex = children.findIndex(el => el.tagName === "H3" && el.textContent.includes("Comment nous aider"));
    const html = elements => elements.map(el => el.outerHTML).join("");
    const sections = [...document.querySelectorAll("#story > section:not(#french-translation-source)")];

    sections[0].innerHTML = html(children.slice(0, healthIndex)).replace('<aside class="french-funding-card" aria-label="Objectif financier immédiat">', '<aside class="french-funding-card" aria-label="Objectif financier immédiat" hidden>');
    sections[1].innerHTML = '<p class="section-label">Santé et guérison</p><h2>Sascha bénéficie d’un suivi professionnel étroit</h2>' + html(children.slice(healthIndex + 1, futureIndex));
    sections[2].innerHTML = '<p class="section-label">Reconstruire notre avenir</p><h2>Nous créons activement de nouvelles sources de revenus</h2>' + html(children.slice(futureIndex + 1, quoteIndex - 1));
    sections[3].innerHTML = '<p class="section-label">Rencontrez notre famille</p><h2>Les chats au cœur de notre foyer</h2><p>Chacun possède sa personnalité, ses habitudes, ses amitiés et sa manière unique d’apporter de l’amour dans nos vies. Voici quelques-uns des membres de notre famille que votre soutien nous aide à protéger et à garder ensemble.</p>' + sections[3].querySelector(".cat-gallery-grid").outerHTML
      .replace("Aiko in his favorite box", "Aiko dans sa boîte préférée").replace("Kalea on his throne", "Kalea sur son trône").replace("Amore and Milo at the window", "Amore et Milo à la fenêtre").replace("Masaya cuddles", "Les câlins de Masaya").replace("Aiko taking it easy", "Aiko se détend");
    sections[4].innerHTML = '<p class="section-label">Les paroles que je garde avec moi</p><h2>Mon passage préféré · Proverbes 3:24–26</h2>' + html(children.slice(quoteIndex - 1, quoteIndex + 1));
    sections[5].innerHTML = '<p class="section-label">Comment nous aider</p><h2>Chaque forme de soutien nous donne du souffle</h2>' + html(children.slice(helpIndex + 1));
    sections[5].id = "ways";
    sections[6].innerHTML = '<p class="section-label">Notre promesse de transparence</p><h2>Une communication claire et honnête</h2><p>Il s’agit d’une collecte de fonds personnelle et indépendante, et non d’une association caritative enregistrée. Les contributions sont des dons personnels et ne sont pas présentées comme déductibles des impôts.</p><p>Nous comptabilisons séparément les aides financières et les aides importantes en nature, tout en protégeant les informations médicales, financières et personnelles.</p><p><strong>La confiance est trop importante pour accepter moins.</strong></p>';

    setHTML(".story-donation-card", '<p class="story-donation-kicker">L’aide reste toujours à portée de main</p><h2>Gardons notre famille unie</h2><p>Votre aide soutient l’hypothèque, les nécessités quotidiennes, les soins aux chats et notre retour vers un revenu stable.</p><button class="button button-primary button-wide js-donate" type="button">Donner maintenant</button><button class="button button-outline button-wide js-share" type="button">Partager la campagne</button>');
    setHTML(".campaign-follow-grid > div", '<p class="section-label">Restez à nos côtés</p><h2>Suivez le Miracle Fund au fil des événements</h2><p>Recevez de brèves nouvelles sincères sur Sascha, les chats, notre foyer et chaque étape importante vers la stabilité.</p>');
    const followLabels = document.querySelectorAll(".campaign-follow-form > label");
    if (followLabels[0]?.firstChild) followLabels[0].firstChild.textContent = "Prénom ";
    if (followLabels[1]?.firstChild) followLabels[1].firstChild.textContent = "Adresse e-mail ";
    setText(".campaign-follow-form .button", "Suivre la campagne");
    setHTML(".supporter-intro", '<h2>Chaque geste de soutien nous a permis d’avancer</h2><p><strong><span data-raised>6 645,23 $</span> d’aide comptabilisée depuis avril 2026.</strong> Des personnes et des organisations bienveillantes nous ont aidés par des dons, des courses, du transport, le paiement de factures, de la nourriture et de la litière pour chats, ainsi que par leurs encouragements.</p>');
    setHTML(".contact-details", '<p class="section-label">Contact</p><h2>Contacter Gemma</h2><p>Pour toute question sur la campagne, les dons internationaux via Wise, les projets numériques, les mises en relation ou une aide pratique :</p><address><strong>Gemma Serenity Gorokhoff</strong><span>Maricopa, Arizona 85138</span><a href="tel:+15202339602">520-233-9602</a><a href="mailto:home@withthecats.org">home@withthecats.org</a></address>');
    setText(".mobile-donate-bar .js-donate", "Donner");
    setText(".mobile-donate-bar .js-share", "Partager");
  }

  source?.remove();
})();
