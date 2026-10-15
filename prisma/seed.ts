import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ECHO restaurant database...");

  // Clear existing
  await prisma.orderStatusEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItemCustomization.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.menuItemTranslation.deleteMany();
  await prisma.customizationOption.deleteMany();
  await prisma.customizationGroup.deleteMany();
  await prisma.menuItemVariant.deleteMany();
  await prisma.menuItemAllergen.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurantSettings.deleteMany();

  // 1. Restaurant Settings
  await prisma.restaurantSettings.create({
    data: {
      name: "ECHO",
      tagline: "Wild Botanicals & Open Hearth Gastronomy",
      story:
        "At ECHO, we return to the elemental rhythm of open-flame cooking, wild aromatics, and heirloom grains. Sourced directly from regenerative coastal foragers and biodynamic orchards, our menu reflects an echo of ancient gastronomic tradition elevated by contemporary precision.",
      baseCurrency: "USD",
      taxRateBps: 825, // 8.25%
      deliveryFeeMinor: 500, // $5.00
      packagingFeeMinor: 200, // $2.00
      fulfillmentModes: JSON.stringify(["DINE_IN", "PICKUP", "DELIVERY"]),
      openingHours: JSON.stringify({
        "Tuesday - Thursday": "5:30 PM - 10:30 PM",
        "Friday - Saturday": "5:00 PM - 11:30 PM",
        Sunday: "4:30 PM - 9:30 PM",
        Monday: "Closed for Foraging & Fermentation",
      }),
      address: "448 Hearthstone Way, Artisan District",
      phone: "+1 (555) 324-6324",
      email: "concierge@echo-restaurant.com",
      deliveryZones: JSON.stringify([
        { name: "Artisan District & Downtown", feeMinor: 500, estimatedMinutes: "25-35" },
        { name: "Metropolitan Area (Up to 8 miles)", feeMinor: 850, estimatedMinutes: "40-55" },
      ]),
    },
  });

  // 2. Categories
  const categoriesData = [
    {
      slug: "hearth-starters",
      name: "Hearth Starters & Crudo",
      description: "Small plates kissed by charcoal flame and delicate raw cures.",
      sortOrder: 1,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "garden-forage",
      name: "Wild Garden & Botanicals",
      description: "Living botanical greens, ember-roasted roots, and wild herbs.",
      sortOrder: 2,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "open-fire-mains",
      name: "Open Fire Hearth Mains",
      description: "Primal cuts, cedar-planked game, and ember-caramelized vegetables.",
      sortOrder: 3,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "heritage-grains",
      name: "Heritage Grains & Hearth Pots",
      description: "Ancient farro, ember-cooked wild rices, and fermented broths.",
      sortOrder: 4,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "botanical-pastas",
      name: "Botanical Handcrafted Pastas",
      description: "Stone-milled extruded doughs enriched with forest fungi and herbs.",
      sortOrder: 5,
      imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "coastal-fire",
      name: "Wild Coastal Catch",
      description: "Sustainably speared and line-caught seafood cooked over live fruitwood.",
      sortOrder: 6,
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "sweet-embers",
      name: "Sweet Embers & Patisserie",
      description: "Charred stone fruits, smoked honey ganache, and botanical sorbets.",
      sortOrder: 7,
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    },
    {
      slug: "elixirs-ferments",
      name: "Artisanal Elixirs & Ferments",
      description: "Living water kefirs, smoked shrub sodas, and wild pine infusions.",
      sortOrder: 8,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.menuCategory.create({ data: cat });
    categories[cat.slug] = created.id;
  }

  // 3. Menu Items with Variants, Customizations, Allergens, and Translations
  const dishes = [
    // 1. Smoke-Kissed Beetroot Tartare
    {
      categoryId: categories["hearth-starters"],
      slug: "smoke-kissed-beetroot-tartare",
      name: "Smoke-Kissed Beetroot Tartare",
      description: "Ember-buried ruby beets, whipped cashew chevre, fermented pine needle oil, sourdough crisp.",
      basePriceMinor: 1800, // $18.00
      spiceLevel: 1,
      cookingTechnique: "COLD_SMOKE",
      dietaryFlags: JSON.stringify(["VEGAN", "VEGETARIAN", "DAIRY_FREE"]),
      prepTimeMinutes: 12,
      isAvailable: true,
      isFeatured: true,
      isSignature: true,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
      allergens: ["NUTS", "GLUTEN"],
      variants: [
        { name: "Artisan Tasting Portion", priceMinor: 1800, isDefault: true },
        { name: "Shareable Hearth Plate", priceMinor: 2800, isDefault: false },
      ],
      customizationGroups: [
        {
          name: "Sourdough Crisp Choice",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "Heirloom Rye & Fennel Crisp", priceDeltaMinor: 0, isDefault: true },
            { name: "Gluten-Free Seeded Flax Lavash", priceDeltaMinor: 200, isDefault: false },
          ],
        },
        {
          name: "Botanical Additions",
          minSelections: 0,
          maxSelections: 2,
          isRequired: false,
          options: [
            { name: "Shaved Black Autumn Truffle", priceDeltaMinor: 900, isDefault: false },
            { name: "Smoked Sea Salt Flakes", priceDeltaMinor: 0, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "स्मोक्ड चुकंदर टार्टारे",
          description: "अंगारों में भुना चुकंदर, काजू चेवरे, फ़र्मेंटेड चीड़ का तेल और कुरकुरी सोरडो ब्रेड।",
          ingredientsText: "चुकंदर, काजू क्रीम, चीड़ का अर्क, राई की ब्रेड",
        },
        {
          locale: "te",
          name: "స్మోక్డ్ బీట్‌రూట్ టార్టారే",
          description: "నిప్పుల మీద కాల్చిన దుంపలు, జీడిపప్పు క్రీమ్ మరియు ఇంట్లో తయారుచేసిన క్రంచీ రొట్టె.",
          ingredientsText: "బీట్‌రూట్, జీడిపప్పు, పైన్ ఆయిల్, పులియబెట్టిన రొట్టె",
        },
        {
          locale: "es",
          name: "Tartar de Remolacha Ahumada a la Brasa",
          description: "Remolachas asadas al rescoldo, chèvre de anacardos, aceite de pino fermentado y crujiente de masa madre.",
          ingredientsText: "Remolacha, anacardo, aceite de pino, centeno",
        },
        {
          locale: "fr",
          name: "Tartare de Betterave Fumé au Brasero",
          description: "Betteraves cuites sous la cendre, chèvre de cajou crémeux, huile de pin fermentée et tuile au levain.",
          ingredientsText: "Betterave, noix de cajou, huile de pin, seigle",
        },
      ],
    },

    // 2. Hearth Charred King Oyster Skewers
    {
      categoryId: categories["hearth-starters"],
      slug: "charred-king-oyster-skewers",
      name: "Charred King Oyster Skewers",
      description: "Robata-grilled trumpet mushrooms, smoked tamari glaze, wild sumac, toasted benne seeds.",
      basePriceMinor: 1600, // $16.00
      spiceLevel: 1,
      cookingTechnique: "HEARTH_FIRE",
      dietaryFlags: JSON.stringify(["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "DAIRY_FREE"]),
      prepTimeMinutes: 10,
      isAvailable: true,
      isFeatured: false,
      isSignature: false,
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
      sortOrder: 2,
      allergens: ["SOY", "SESAME"],
      variants: [
        { name: "2 Skewers (Solo)", priceMinor: 1600, isDefault: true },
        { name: "4 Skewers (Table Sharing)", priceMinor: 2900, isDefault: false },
      ],
      customizationGroups: [
        {
          name: "Spice Nuance",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "Mild Smoked Tamari", priceDeltaMinor: 0, isDefault: true },
            { name: "Wild Chili & Fermented Garlic Glaze", priceDeltaMinor: 150, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "तंदूरी किंग ऑयस्टर मशरूम सीख",
          description: "अंगारों पर भुने मशरूम, सोया ग्लेज़, जंगली सुमाक और भुने तिल।",
        },
        {
          locale: "te",
          name: "కింగ్ ఆయిస్టర్ పుట్టగొడుగుల కబాబ్",
          description: "నిప్పులపై కాల్చిన అడవి పుట్టగొడుగులు, సోయా సాస్ మరియు నువ్వులు.",
        },
        {
          locale: "es",
          name: "Brochetas de Seta de Cardo a la Brasa",
          description: "Setas a la parrilla robata, glaseado de tamari ahumado, zumaque silvestre y ajonjolí tostado.",
        },
        {
          locale: "fr",
          name: "Brochettes de Pleurotes Éryngii Braisées",
          description: "Pleurotes grillés au feu de bois, laqué au tamari fumé, sumac sauvage et graines de sésame torréfiées.",
        },
      ],
    },

    // 3. Foraged Cedar Hearth Salmon
    {
      categoryId: categories["coastal-fire"],
      slug: "cedar-hearth-wild-salmon",
      name: "Foraged Cedar Hearth Salmon",
      description: "Wild Pacific king salmon slow-roasted over aromatic cedar wood, wild spruce tip butter, ember leeks.",
      basePriceMinor: 3800, // $38.00
      spiceLevel: 0,
      cookingTechnique: "WOOD_ROASTED",
      dietaryFlags: JSON.stringify(["GLUTEN_FREE", "HALAL"]),
      prepTimeMinutes: 20,
      isAvailable: true,
      isFeatured: true,
      isSignature: true,
      imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
      allergens: ["FISH", "DAIRY"],
      variants: [
        { name: "Cedar Plank Cut (7 oz)", priceMinor: 3800, isDefault: true },
        { name: "Captain's Cut (10 oz)", priceMinor: 4800, isDefault: false },
      ],
      customizationGroups: [
        {
          name: "Butter Preparation",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "Wild Spruce Tip & Chive Butter", priceDeltaMinor: 0, isDefault: true },
            { name: "Dairy-Free Smoked Olive Oil Emulsion", priceDeltaMinor: 0, isDefault: false },
          ],
        },
        {
          name: "Side Accompaniment",
          minSelections: 0,
          maxSelections: 1,
          isRequired: false,
          options: [
            { name: "Charred Fingerling Potatoes", priceDeltaMinor: 600, isDefault: false },
            { name: "Wood-Fired Wild Greens", priceDeltaMinor: 500, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "देवदार की लकड़ी पर भुनी सैल्मन मछली",
          description: "जंगली सैल्मन मछली को देवदार की लकड़ी की धीमी आंच पर पकाया गया, जंगली मक्खन और भुने लीक के साथ।",
        },
        {
          locale: "te",
          name: "దేవదార్ కర్రల మంటపై కాల్చిన సాల్మన్ చేప",
          description: "తాజా అడవి సాల్మన్ చేప, ప్రత్యేకమైన మూలికా వెన్న మరియు కూరగాయలతో వడ్డిస్తారు.",
        },
        {
          locale: "es",
          name: "Salmón Salvaje a la Tabla de Cedro",
          description: "Salmón rey del Pacífico asado lentamente sobre madera de cedro, mantequilla de brotes de abeto y puerros al rescoldo.",
        },
        {
          locale: "fr",
          name: "Saumon Sauvage sur Planche de Cèdre",
          description: "Saumon sauvage cuit délicatement sur bois de cèdre fumant, beurre aux bourgeons d'épicéa et poireaux braisés.",
        },
      ],
    },

    // 4. Wood-Fired Heritage Grain Risotto
    {
      categoryId: categories["heritage-grains"],
      slug: "wood-fired-heritage-grain-risotto",
      name: "Wood-Fired Heritage Grain Risotto",
      description: "Emmer farro and heirloom barley simmered in roasted mushroom broth, black garlic puree, aged raw milk pecorino.",
      basePriceMinor: 2800, // $28.00
      spiceLevel: 0,
      cookingTechnique: "SLOW_FERMENTED",
      dietaryFlags: JSON.stringify(["VEGETARIAN"]),
      prepTimeMinutes: 18,
      isAvailable: true,
      isFeatured: true,
      isSignature: false,
      imageUrl: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
      allergens: ["GLUTEN", "DAIRY"],
      variants: [
        { name: "Individual Cocotte", priceMinor: 2800, isDefault: true },
        { name: "Feasting Cocotte for Two", priceMinor: 5200, isDefault: false },
      ],
      customizationGroups: [
        {
          name: "Cheese Option",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "24-Month Aged Pecorino", priceDeltaMinor: 0, isDefault: true },
            { name: "Vegan Fermented Cashew Parmesan", priceDeltaMinor: 0, isDefault: false },
          ],
        },
        {
          name: "Chef's Finishing Luxury",
          minSelections: 0,
          maxSelections: 1,
          isRequired: false,
          options: [
            { name: "Fresh Winter Truffle Shavings", priceDeltaMinor: 1200, isDefault: false },
            { name: "Crispy Sunchoke Chips", priceDeltaMinor: 300, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "लकड़ी की आंच पर पका प्राचीन अनाज रिसोट्टो",
          description: "मशरूम के काढ़े में धीमे पके प्राचीन अनाज, काला लहसुन और 24 महीने पुराना पेकोरिनो चीज़।",
        },
        {
          locale: "te",
          name: "పురాతన ధాన్యాల రిసోట్టో",
          description: "అడవి పుట్టగొడుగుల రసంలో ఉడికించిన ప్రత్యేక ధాన్యాలు, వెల్లుల్లి పేస్ట్ మరియు జున్ను.",
        },
        {
          locale: "es",
          name: "Risotto de Granos Ancestrales al Horno de Leña",
          description: "Farro emmer y cebada ancestral a fuego lento con caldo de setas asadas, puré de ajo negro y pecorino curado.",
        },
        {
          locale: "fr",
          name: "Risotto de Céréales Anciennes au Feu de Bois",
          description: "Épeautre et orge ancienne mijotés au bouillon de cèpes, purée d'ail noir et pecorino affiné.",
        },
      ],
    },

    // 5. Fire-Roasted Cauliflower Steak
    {
      categoryId: categories["open-fire-mains"],
      slug: "fire-roasted-cauliflower-steak",
      name: "Fire-Roasted Cauliflower Steak",
      description: "Whole head charred over almond wood embers, spiced pistachio salsa verde, pomegranate reduction, mint oil.",
      basePriceMinor: 2400, // $24.00
      spiceLevel: 2,
      cookingTechnique: "HEARTH_FIRE",
      dietaryFlags: JSON.stringify(["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "DAIRY_FREE"]),
      prepTimeMinutes: 15,
      isAvailable: true,
      isFeatured: false,
      isSignature: false,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
      sortOrder: 2,
      allergens: ["NUTS"],
      variants: [{ name: "Standard Hearth Cut", priceMinor: 2400, isDefault: true }],
      customizationGroups: [
        {
          name: "Nut-Free Modification",
          minSelections: 0,
          maxSelections: 1,
          isRequired: false,
          options: [{ name: "Nut-Free Sunflower Seed Salsa", priceDeltaMinor: 0, isDefault: false }],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "अंगारों पर भुना गोभी स्टेक",
          description: "बादाम की लकड़ी पर सिकी फूलगोभी, पिस्ता सालसा वर्दे और अनार का अर्क।",
        },
        {
          locale: "te",
          name: "నిప్పులపై వేయించిన కాలీఫ్లవర్ స్టీక్",
          description: "ప్రత్యేక మంటపై కాల్చిన తాజా కాలీఫ్లవర్, పిస్తా చట్నీ మరియు దానిమ్మ రసంతో వడ్డిస్తారు.",
        },
        {
          locale: "es",
          name: "Bife de Coliflor Asado al Fuego Vivo",
          description: "Coliflor entera tostada sobre brasas de almendro, salsa verde de pistacho especiado y reducción de granada.",
        },
        {
          locale: "fr",
          name: "Steak de Chou-Fleur Rôti au Feu de Bois",
          description: "Chou-fleur doré sur braises d'amandier, salsa verde aux pistaches épicées et réduction de grenade.",
        },
      ],
    },

    // 6. 45-Day Dry-Aged Hearth Ribeye
    {
      categoryId: categories["open-fire-mains"],
      slug: "dry-aged-hearth-ribeye",
      name: "45-Day Dry-Aged Hearth Ribeye",
      description: "Prime bone-in ribeye seared on cast iron over oak fire, bone marrow emulsion, fermented black peppercorns.",
      basePriceMinor: 6800, // $68.00
      spiceLevel: 1,
      cookingTechnique: "HEARTH_FIRE",
      dietaryFlags: JSON.stringify(["GLUTEN_FREE"]),
      prepTimeMinutes: 25,
      isAvailable: true,
      isFeatured: true,
      isSignature: true,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
      allergens: [],
      variants: [
        { name: "16 oz Bone-In Cut", priceMinor: 6800, isDefault: true },
        { name: "24 oz Tomahawk For Two", priceMinor: 9800, isDefault: false },
      ],
      customizationGroups: [
        {
          name: "Temperature & Doneness",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "Rare (Warm Red Center)", priceDeltaMinor: 0, isDefault: false },
            { name: "Medium Rare (Warm Pink Center)", priceDeltaMinor: 0, isDefault: true },
            { name: "Medium (Warm Pink Throughout)", priceDeltaMinor: 0, isDefault: false },
            { name: "Medium Well", priceDeltaMinor: 0, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "45-दिन सूखा-पक्व रिबआई स्टेक",
          description: "बलूत की लकड़ी की आग पर सिका उत्तम रिबआई मांस, काली मिर्च और बोन मैरो सॉस के साथ।",
        },
        {
          locale: "te",
          name: "ఓక్ మంటపై కాల్చిన స్టీక్",
          description: "ప్రత్యేకమైన పద్ధతిలో నిల్వ చేసిన మరియు కాల్చిన మాంసం, అడవి మిరియాల సాస్ తో.",
        },
        {
          locale: "es",
          name: "Ribeye a la Brasa Madurado 45 Días",
          description: "Corte premium con hueso sellado a fuego de roble, emulsión de tuétano y pimienta negra fermentada.",
        },
        {
          locale: "fr",
          name: "Entrecôte Maturée 45 Jours au Brasier",
          description: "Pièce noble rôtie sur braises de chêne, émulsion à la moelle et grains de poivre noir fermentés.",
        },
      ],
    },

    // 7. Wild Pine Needle & Juniper Elixir
    {
      categoryId: categories["elixirs-ferments"],
      slug: "wild-pine-juniper-elixir",
      name: "Wild Pine Needle & Juniper Elixir",
      description: "Cold-extracted white pine needles, crushed juniper berry tonic, sparkling birch sap, charred rosemary sprig.",
      basePriceMinor: 1100, // $11.00
      spiceLevel: 0,
      cookingTechnique: "RAW",
      dietaryFlags: JSON.stringify(["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "DAIRY_FREE", "HALAL"]),
      prepTimeMinutes: 5,
      isAvailable: true,
      isFeatured: false,
      isSignature: true,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
      allergens: [],
      variants: [{ name: "Handcrafted Tumbler", priceMinor: 1100, isDefault: true }],
      customizationGroups: [
        {
          name: "Sweetness Profile",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "Dry Botanical (Crisp & Tart)", priceDeltaMinor: 0, isDefault: true },
            { name: "Wild Honey Infused (Gentle Sweetness)", priceDeltaMinor: 100, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "चीड़ और जुनिपर अमृत शरबत",
          description: "सफेद चीड़ की पत्तियों और जुनिपर बेरी का ताज़ा पेय, स्पार्कलिंग बर्च रस के साथ।",
        },
        {
          locale: "te",
          name: "అడవి మూలికల పానీయం",
          description: "పైన్ మరియు జునిపర్ బెర్రీలతో చేసిన సువాసనగల సహజ శీతల పానీయం.",
        },
        {
          locale: "es",
          name: "Elixir Silvestre de Acículas de Pino y Enebro",
          description: "Agujas de pino blanco extraídas en frío, tónica de bayas de enebro, savia de abedul con burbuja fina.",
        },
        {
          locale: "fr",
          name: "Élixir d'Aiguilles de Pin Sauvage & Genièvre",
          description: "Extraction à froid d'aiguilles de pin blanc, tonique aux baies de genièvre et sève de bouleau pétillante.",
        },
      ],
    },

    // 8. Smoked Honey & Dark Cacao Ember Cake
    {
      categoryId: categories["sweet-embers"],
      slug: "smoked-honey-dark-cacao-cake",
      name: "Smoked Honey & Dark Cacao Ember Cake",
      description: "Flourless 72% Venezuelan dark chocolate fondant, wildflower smoked honey drizzle, toasted chestnut gelato.",
      basePriceMinor: 1600, // $16.00
      spiceLevel: 0,
      cookingTechnique: "WOOD_ROASTED",
      dietaryFlags: JSON.stringify(["VEGETARIAN", "GLUTEN_FREE"]),
      prepTimeMinutes: 12,
      isAvailable: true,
      isFeatured: true,
      isSignature: true,
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
      allergens: ["DAIRY", "EGGS", "NUTS"],
      variants: [{ name: "Warm Fondant for One", priceMinor: 1600, isDefault: true }],
      customizationGroups: [
        {
          name: "Gelato Selection",
          minSelections: 1,
          maxSelections: 1,
          isRequired: true,
          options: [
            { name: "Toasted Chestnut Gelato", priceDeltaMinor: 0, isDefault: true },
            { name: "Smoked Bourbon Vanilla Gelato", priceDeltaMinor: 0, isDefault: false },
            { name: "Dark Berry Wild Sorbet (Dairy-Free)", priceDeltaMinor: 0, isDefault: false },
          ],
        },
      ],
      translations: [
        {
          locale: "hi",
          name: "स्मोक्ड शहद और डार्क चॉकलेट एम्बर केक",
          description: "गर्म डार्क चॉकलेट केक, जंगली स्मोक्ड शहद और भुने हुए चेस्टनट आइसक्रीम के साथ।",
        },
        {
          locale: "te",
          name: "డార్క్ చాక్లెట్ అండ్ తేనె కేక్",
          description: "నోరూరించే వేడి చాక్లెట్ కేక్, సహజమైన తేనె మరియు చెస్ట్‌నట్ ఐస్‌క్రీమ్‌తో లభిస్తుంది.",
        },
        {
          locale: "es",
          name: "Pastel a la Brasa de Miel Ahumada y Cacao Puro",
          description: "Fondant de chocolate venezolano al 72% sin harina, hilo de miel ahumada y helado de castañas tostadas.",
        },
        {
          locale: "fr",
          name: "Moelleux aux Braises, Chocolat Noir & Miel Fumé",
          description: "Fondant pur cacao vénézuélien 72% sans farine, filet de miel fumé et glace aux châtaignes grillées.",
        },
      ],
    },
  ];

  for (const dish of dishes) {
    const { allergens, variants, customizationGroups, translations, ...itemData } = dish;
    const item = await prisma.menuItem.create({
      data: itemData,
    });

    // Create allergens
    for (const a of allergens) {
      await prisma.menuItemAllergen.create({
        data: { itemId: item.id, allergen: a },
      });
    }

    // Create variants
    for (const v of variants) {
      await prisma.menuItemVariant.create({
        data: { ...v, itemId: item.id },
      });
    }

    // Create customization groups & options
    for (const group of customizationGroups) {
      const { options, ...groupData } = group;
      const createdGroup = await prisma.customizationGroup.create({
        data: { ...groupData, itemId: item.id },
      });
      for (const opt of options) {
        await prisma.customizationOption.create({
          data: { ...opt, groupId: createdGroup.id },
        });
      }
    }

    // Create translations
    for (const trans of translations) {
      await prisma.menuItemTranslation.create({
        data: { ...trans, itemId: item.id },
      });
    }
  }

  console.log(`Seeded ${categoriesData.length} categories and ${dishes.length} rich culinary dishes with multi-language translations.`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
