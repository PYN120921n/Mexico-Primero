// seed-loader.js
class SeedLoader {
  constructor() {
    this.seedData = `achiote, bixa orellana, intermedia, diciembre-febrero,30000,504
anacahuita, cordia sebestena L., intermedia, mayo-junio,700,358
balché, lonchocarpus punctatus kunth/sinonimo lonchocarpus longistylus pittier, intermedia, febrero-junio,3000,560
campanita amarilla, thevetia, peruviana, intermedia, mayo-junio, 320, 392
campanita de monte, cascabela gaumeri (Hemsl.) Lippol, intermedia, mayo-junio, 300, 392
caoba, swietenia macrophylla, intermedia, febrero-marzo, 1600, 817
cedro, cedrela odorata, ortodoxa, febrero-marzo, 25000, 817
ceiba, ceiba pentandra (L.) gaertn., recalcitrante, mayo, 4000, 1680
chac bojon, colubrina arborescens (milli.) sarg., recalcitrante, mayo, 50000, 560
chacsikin, caesalpinia pulcherrima (L.) sw., intermedia, junio-julio, 5300, 537
chacteviga/chacte, coulteria mollis kunth, intermedia, abril-mayo, 5000, 560
chaka, bursera simaruba (L.) sarg., vareta, todo el año, 1, 5
ciricote, cordia dodecandra Dc., intermedia, abril-agosto, 350, 358
huano/hoja grande, sabal mexicana, recalcitrante, agosto, 1500, 358
huano macho/hoja pequeña, sabal yapa, recalcitrante, julio-agosto, 4000,358
huaxin/tumbapelo, leucaena leucocephala, recalcitrante, agosto-septiembre, 12000, 560
jabin, piscidia piscipula (L.) sarg., intermedia, marzo-abril, 25000, 1680
katalox, swatzia cubensis (britton& P. Wilson) standl.var.cubensis,  recalcitrante, abril-mayo, 700, 784
kaniste, pouteria campecheania, recalcitrante, marzo-abril, 550, 616
lipia/ lipia brasileña, aloysia virgata (Ruiz & pav.) Juss / sinonimo - lippia virgata, vareta, todo el año, 1, 5
maculis rosado, tabebuia rosea (Bertol.) Dc., recalcitrante, febrero marzo, 20000, 716
pasak/negrito/falso pistache, simarouba glaucac dc., recalcitrante, abril-mayo,1200, 560
pich, enterolobium cyclocarpum (jacq.) Griseb., ortodoxa, marzo-abril, 1000, 358
pixoy, guazuma ulmifolia lam, intermedia, mayo-junio, 100000, 1680
ramon, brosimum alicastrum sw, recalcitrante, mayo-agosto, 350, 358
roble, erethia tinifolia L., intermedia, julio-agosto, 16000, 560
sak ya\`ap, gliricidia sepium, (Jacq.) kunth. ex walp., vareta, todo el año, 1, 5
tzalam, lysiloma latissiliquum (L.) benth., recalcitrante, septiembre, 20000, 1680
uva de mar, coccoloba uvifera (L.) L., recalcitrante, agosto-septiembre, 1200, 560
xkanlol, tecoma stans (L.) Juss. ex kunth var stans, recalcitrante, abril, 181000, 616
caracolillo, sideroxylon capiri tempisque,  recalcitrante, abril, 400, 504
zapote/zapote de huevo de chivo, manilkara zapota (L.)P. Royen, recalcitrante, mayo-junio, 1500, 672`;

    this.seeds = [];
    this.parseSeedData();
  }

  parseSeedData() {
    const lines = this.seedData.split('\n');

    lines.forEach((line, index) => {
      const parts = line.split(',').map(part => part.trim());

      if (parts.length >= 6) {
        const commonName = parts[0];
        const scientificName = parts[1];
        const classification = this.normalizeClassification(parts[2]);
        const availableMonths = parts[3];
        const seedsPerKilo = parseInt(parts[4].replace(/\s/g, ''));
        const unitPrice = parseFloat(parts[5].replace(/\s/g, ''));

        const seed = {
          id: `SEM-${index + 1}`,
          commonName: commonName,
          scientificName: scientificName,
          classification: classification,
          availableMonths: availableMonths,
          seedsPerKilo: seedsPerKilo,
          unitPrice: unitPrice,
          stock: 1.00,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.seeds.push(seed);
      }
    });
  }

  normalizeClassification(classification) {
    const classificationMap = {
      'intermedia': 'intermedia',
      'ortodoxa': 'ortodoxa',
      'recalcitrante': 'recalcitrante',
      'recalcitante': 'recalcitrante',
      'vareta': 'vareta'
    };

    const lowerClass = classification.toLowerCase().trim();
    return classificationMap[lowerClass] || 'intermedia';
  }

  loadToLocalStorage() {
    const existingSeeds = JSON.parse(localStorage.getItem('vivero_semillas')) || [];
    const existingScientificNames = new Set(existingSeeds.map(seed => seed.scientificName.toLowerCase()));

    const newSeeds = this.seeds.filter(seed =>
      !existingScientificNames.has(seed.scientificName.toLowerCase())
    );

    if (newSeeds.length > 0) {
      const allSeeds = [...existingSeeds, ...newSeeds];
      localStorage.setItem('vivero_semillas', JSON.stringify(allSeeds));

      return {
        success: true,
        added: newSeeds.length,
        total: allSeeds.length,
        duplicates: this.seeds.length - newSeeds.length
      };
    } else {
      return {
        success: false,
        added: 0,
        total: existingSeeds.length,
        duplicates: this.seeds.length
      };
    }
  }
}

// Exportar para uso global
window.SeedLoader = SeedLoader;