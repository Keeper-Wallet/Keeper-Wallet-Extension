import {
  dataEntriesToRecord,
  fetchDataEntries,
} from '../../nodeApi/dataEntries';
import {
  type CreateParams,
  type FetchInfoParams,
  type NftAssetDetail,
  type NftVendor,
  NftVendorId,
} from '../types';
import { capitalize } from '../utils';

const DUCKLINGS_DAPP = '3PKmLiGEfqLWMC1H9xhzqvAZKUXfFm8uoeg';

interface DucklingsNftInfo {
  growthLevel: number;
  id: string;
  vendor: NftVendorId.Ducklings;
}

function ducklingLevelKey(id: string) {
  return `duckling_${id}_level`;
}

export class DucklingsNftVendor implements NftVendor<DucklingsNftInfo> {
  id = NftVendorId.Ducklings as const;

  is(nft: NftAssetDetail) {
    return nft.issuer === DUCKLINGS_DAPP;
  }

  fetchInfo({ nfts, nodeUrl }: FetchInfoParams) {
    if (nfts.length === 0) {
      return [];
    }

    const nftIds = nfts.map(nft => nft.assetId);

    return fetchDataEntries({
      nodeUrl,
      address: DUCKLINGS_DAPP,
      keys: nftIds.map(ducklingLevelKey),
    })
      .then(dataEntriesToRecord)
      .then(dataEntries =>
        nftIds.map((id): DucklingsNftInfo => {
          // eslint-disable-next-line radix
          const level = parseInt(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (dataEntries[ducklingLevelKey(id)] as any) ?? 0,
          );

          return {
            growthLevel: level > 0 ? level / 1e14 : 0,
            id,
            vendor: NftVendorId.Ducklings,
          };
        }),
      );
  }

  create({ asset, info }: CreateParams<DucklingsNftInfo>) {
    const nameIndex = [10, 4, 2, 0, 2, 1].reduce(
      (acc, index) => acc + asset.id.charCodeAt(index),
      0,
    );

    const ducklingNames = Object.keys(DUCKLING_DESCRIPTIONS);
    const name = ducklingNames[nameIndex % ducklingNames.length];

    const adjectiveIndex = [16, 10, 1, 9, 9, 7].reduce(
      (acc, index) => acc + asset.id.charCodeAt(index),
      0,
    );

    return {
      background: { backgroundColor: '#f0e7d5' },
      creator: asset.issuer,
      description: DUCKLING_DESCRIPTIONS[name],
      displayCreator: 'Ducklings',

      displayName: `${capitalize(
        DUCKLING_ADJECTIVES[adjectiveIndex % DUCKLING_ADJECTIVES.length],
      )} ${capitalize(name)}`,

      foreground: info
        ? `https://wavesducks.com/ducks/ducklings/duckling-${Math.min(
            Math.trunc(info.growthLevel / 25),
            3,
          )}.svg`
        : undefined,

      id: asset.id,
      marketplaceUrl: `https://wavesducks.com/duckling/${asset.id}`,
      name: asset.name,
      vendor: NftVendorId.Ducklings,
    };
  }
}

const DUCKLING_ADJECTIVES = [
  'admiring',
  'adoring',
  'affectionate',
  'agitated',
  'amazing',
  'angry',
  'awesome',
  'beautiful',
  'blissful',
  'bold',
  'boring',
  'brave',
  'busy',
  'charming',
  'clever',
  'cool',
  'compassionate',
  'competent',
  'condescending',
  'confident',
  'cranky',
  'crazy',
  'dazzling',
  'determined',
  'distracted',
  'dreamy',
  'eager',
  'ecstatic',
  'elastic',
  'elated',
  'elegant',
  'eloquent',
  'epic',
  'exciting',
  'fervent',
  'festive',
  'flamboyant',
  'focused',
  'friendly',
  'frosty',
  'funny',
  'gallant',
  'gifted',
  'goofy',
  'gracious',
  'great',
  'happy',
  'hardcore',
  'heuristic',
  'hopeful',
  'hungry',
  'infallible',
  'inspiring',
  'interesting',
  'intelligent',
  'jolly',
  'jovial',
  'keen',
  'kind',
  'laughing',
  'loving',
  'lucid',
  'magical',
  'mystifying',
  'modest',
  'musing',
  'naughty',
  'nervous',
  'nice',
  'nifty',
  'nostalgic',
  'objective',
  'optimistic',
  'peaceful',
  'pedantic',
  'pensive',
  'practical',
  'priceless',
  'quirky',
  'quizzical',
  'recursing',
  'relaxed',
  'reverent',
  'romantic',
  'sad',
  'serene',
  'sharp',
  'silly',
  'sleepy',
  'stoic',
  'strange',
  'stupefied',
  'suspicious',
  'sweet',
  'tender',
  'thirsty',
  'trusting',
  'unruffled',
  'upbeat',
  'vibrant',
  'vigilant',
  'vigorous',
  'wizardly',
  'wonderful',
  'xenodochial',
  'youthful',
  'zealous',
  'zen',
];

const DUCKLING_DESCRIPTIONS: Partial<Record<string, string>> = {
  agnesi:
    'Maria Gaetana Agnesi - Italian mathematician, philosopher, theologian and humanitarian. She was the first woman to write a mathematics handbook and the first woman appointed as a Mathematics Professor at a University.',
  albattani:
    'Muhammad ibn Jābir al-Ḥarrānī al-Battānī was a founding father of astronomy.',
  allen:
    "Frances E. Allen, became the first female IBM Fellow in 1989. In 2006, she became the first female recipient of the ACM's Turing Award.",
  almeida:
    'June Almeida - Scottish virologist who took the first pictures of the rubella virus.',
  antonelli:
    'Kathleen Antonelli, American computer programmer and one of the six original programmers of the ENIAC.',
  archimedes:
    'Archimedes was a physicist, engineer and mathematician who invented too many things to list them here.',
  ardinghelli:
    'Maria Ardinghelli - Italian translator, mathematician and physicist.',
  aryabhata:
    'Aryabhata - Ancient Indian mathematician-astronomer during 476-550 CE.',
  austin:
    'Wanda Austin - Wanda Austin is the President and CEO of The Aerospace Corporation, a leading architect for the US security space programs.',
  babbage: 'Charles Babbage invented the concept of a programmable computer.',
  banach:
    'Stefan Banach - Polish mathematician, was one of the founders of modern functional analysis.',
  banzai:
    'Buckaroo Banzai and his mentor Dr. Hikita perfected the "oscillation overthruster", a device that allows one to pass through solid matter.',
  bardeen: 'John Bardeen co-invented the transistor.',
  bartik:
    'Jean Bartik, born Betty Jean Jennings, was one of the original programmers for the ENIAC computer.',
  bassi: "Laura Bassi, the world's first female professor.",
  beaver:
    'Hugh Beaver, British engineer, founder of the Guinness Book of World Records.',
  bell: 'Alexander Graham Bell - an eminent Scottish-born scientist, inventor, engineer and innovator who is credited with inventing the first practical telephone.',
  benz: 'Karl Friedrich Benz - a German automobile engineer. Inventor of the first practical motorcar.',
  bhabha:
    'Homi J Bhabha - was an Indian nuclear physicist, founding director, and professor of physics at the Tata Institute of Fundamental Research. Colloquially known as "father of Indian nuclear programme".',
  bhaskara:
    'Bhaskara II - Ancient Indian mathematician-astronomer whose work on calculus predates Newton and Leibniz by over half a millennium.',
  black:
    'Sue Black - British computer scientist and campaigner. She has been instrumental in saving Bletchley Park, the site of World War II codebreaking.',
  blackburn:
    'Elizabeth Helen Blackburn - Australian-American Nobel laureate; best known for co-discovering telomerase.',
  blackwell:
    'Elizabeth Blackwell - American doctor and first American woman to receive a medical degree.',
  bohr: 'Niels Bohr is the father of quantum theory.',
  booth:
    "Kathleen Booth, she's credited with writing the first assembly language.",
  borg: 'Anita Borg - Anita Borg was the founding director of the Institute for Women and Technology (IWT).',
  bose: 'Satyendra Nath Bose - He provided the foundation for Bose–Einstein statistics and the theory of the Bose–Einstein condensate.',
  bouman:
    'Katherine Louise Bouman is an imaging scientist and Assistant Professor of Computer Science at the California Institute of Technology. She researches computational methods for imaging, and developed an algorithm that made possible the picture first visualization of a black hole using the Event Horizon Telescope.',
  boyd: 'Evelyn Boyd Granville - She was one of the first African-American woman to receive a Ph.D. in mathematics; she earned it in 1949 from Yale University.',
  brahmagupta:
    'Brahmagupta - Ancient Indian mathematician during 598-670 CE who gave rules to compute with zero.',
  brattain: 'Walter Houser Brattain co-invented the transistor.',
  brown: 'Emmett Brown invented time travel.',
  buck: 'Linda Brown Buck - American biologist and Nobel laureate best known for her genetic and molecular analyses of the mechanisms of smell.',
  burnell:
    'Dame Susan Jocelyn Bell Burnell - Northern Irish astrophysicist who discovered radio pulsars and was the first to analyse them.',
  cannon:
    'Annie Jump Cannon - pioneering female astronomer who classified hundreds of thousands of stars and created the system we use to understand stars today.',
  carson:
    'Rachel Carson - American marine biologist and conservationist, her book Silent Spring and other writings are credited with advancing the global environmental movement.',
  cartwright:
    "Dame Mary Lucy Cartwright - British mathematician who was one of the first to study what is now known as chaos theory. Also known for Cartwright's theorem which finds applications in signal processing.",
  carver:
    'George Washington Carver - American agricultural scientist and inventor. He was the most prominent black scientist of the early 20th century.',
  cerf: 'Vinton Gray Cerf - American Internet pioneer, recognised as one of "the fathers of the Internet". With Robert Elliot Kahn, he designed TCP and IP, the primary data communication protocols of the Internet and other computer networks.',
  chandrasekhar:
    'Subrahmanyan Chandrasekhar - Astrophysicist known for his mathematical theory on different stages and evolution in structures of the stars. He has won nobel prize for physics.',
  chaplygin:
    "Sergey Alexeyevich Chaplygin (Russian: Серге́й Алексе́евич Чаплы́гин; April 5, 1869 – October 8, 1942) was a Russian and Soviet physicist, mathematician, and mechanical engineer. He is known for mathematical formulas such as Chaplygin's equation and for a hypothetical substance in cosmology called Chaplygin gas, named after him.",
  chatelet:
    "Émilie du Châtelet - French natural philosopher, mathematician, physicist, and author during the early 1730s, known for her translation of and commentary on Isaac Newton's book Principia containing basic laws of physics.",
  chatterjee:
    'Asima Chatterjee was an Indian organic chemist noted for her research on vinca alkaloids, development of drugs for treatment of epilepsy and malaria.',
  chaum:
    'David Lee Chaum - American computer scientist and cryptographer. Known for his seminal contributions in the field of anonymous communication.',
  chebyshev:
    'Pafnuty Chebyshev - Russian mathematician. He is known fo his works on probability, statistics, mechanics, analytical geometry and number theory.',
  clarke:
    'Joan Clarke - Bletchley Park code breaker during the Second World War who pioneered techniques that remained top secret for decades. Also an accomplished numismatist.',
  cohen:
    'Bram Cohen - American computer programmer and author of the BitTorrent peer-to-peer protocol.',
  colden:
    'Jane Colden - American botanist widely considered the first female American botanist.',
  cori: 'Gerty Theresa Cori - American biochemist who became the third woman—and first American woman—to win a Nobel Prize in science, and the first woman to be awarded the Nobel Prize in Physiology or Medicine. Cori was born in Prague.',
  cray: 'Seymour Roger Cray was an American electrical engineer and supercomputer architect who designed a series of computers that were the fastest in the world for decades.',
  curran:
    "Samuel Curran was an Irish physicist who worked alongside his wife during WWII and invented the proximity fuse. <a href='https://en.wikipedia.org/wiki/Samuel_Curran" +
    '    This entry reflects a husband and wife team who worked together:\n' +
    '    Joan Curran was a Welsh scientist who developed radar and invented chaff, a radar countermeasure.',
  curie: 'Marie Curie discovered radioactivity.',
  darwin: 'Charles Darwin established the principles of natural evolution.',
  davinci: 'Leonardo Da Vinci invented too many things to list here.',
  dewdney:
    'A. K. (Alexander Keewatin) Dewdney, Canadian mathematician, computer scientist, author and filmmaker. Contributor to Scientific American\'s "Computer Recreations" from 1984 to 1991. Author of Core War (program), The Planiverse, The Armchair Universe, The Magic Machine, The New Turing Omnibus, and more.',
  dhawan:
    'Satish Dhawan - Indian mathematician and aerospace engineer, known for leading the successful and indigenous development of the Indian space programme.',
  diffie:
    'Bailey Whitfield Diffie - American cryptographer and one of the pioneers of public-key cryptography.',
  dijkstra:
    'Edsger Wybe Dijkstra was a Dutch computer scientist and mathematical scientist.',
  dirac:
    'Paul Adrien Maurice Dirac - English theoretical physicist who made fundamental contributions to the early development of both quantum mechanics and quantum electrodynamics.',
  driscoll:
    'Agnes Meyer Driscoll - American cryptanalyst during World Wars I and II who successfully cryptanalysed a number of Japanese ciphers. She was also the co-developer of one of the cipher machines of the US Navy, the CM.',
  dubinsky:
    'Donna Dubinsky - played an integral role in the development of personal digital assistants (PDAs) serving as CEO of Palm, Inc. and co-founding Handspring.',
  easley:
    'Annie Easley - She was a leading member of the team which developed software for the Centaur rocket stage and one of the first African-Americans in her field.',
  edison: 'Thomas Alva Edison, prolific inventor.',
  einstein: 'Albert Einstein invented the general theory of relativity.',
  elbakyan:
    'Alexandra Asanovna Elbakyan (Russian: Алекса́ндра Аса́новна Элбакя́н) is a Kazakhstani graduate student, computer programmer, internet pirate in hiding, and the creator of the site Sci-Hub. Nature has listed her in 2016 in the top ten people that mattered in science, and Ars Technica has compared her to Aaron Swartz.',
  elgamal:
    'Taher A. ElGamal - Egyptian cryptographer best known for the ElGamal discrete log cryptosystem and the ElGamal digital signature scheme.',
  elion:
    'Gertrude Elion - American biochemist, pharmacologist and the 1988 recipient of the Nobel Prize in Medicine.',
  ellis:
    'James Henry Ellis - British engineer and cryptographer employed by the GCHQ. Best known for conceiving for the first time, the idea of public-key cryptography.',
  engelbart: 'Douglas Engelbart gave the mother of all demos.',
  euclid: 'Euclid invented geometry.',
  euler: 'Leonhard Euler invented large parts of modern mathematics.',
  faraday:
    'Michael Faraday - British scientist who contributed to the study of electromagnetism and electrochemistry.',
  feistel:
    'Horst Feistel - German-born American cryptographer who was one of the earliest non-government researchers to study the design and theory of block ciphers. Co-developer of DES and Lucifer. Feistel networks, a symmetric structure used in the construction of block ciphers are named after him.',
  fermat: 'Pierre de Fermat pioneered several aspects of modern mathematics.',
  fermi: 'Enrico Fermi invented the first nuclear reactor.',
  feynman:
    'Richard Feynman was a key contributor to quantum mechanics and particle physics.',
  franklin:
    'Benjamin Franklin is famous for his experiments in electricity and the invention of the lightning rod.',
  gagarin:
    'Yuri Alekseyevich Gagarin - Soviet pilot and cosmonaut, best known as the first human to journey into outer space.',
  galileo:
    'Galileo was a founding father of modern astronomy, and faced politics and obscurantism to establish scientific truth.',
  galois:
    'Évariste Galois - French mathematician whose work laid the foundations of Galois theory and group theory, two major branches of abstract algebra, and the subfield of Galois connections, all while still in his late teens.',
  ganguly:
    'Kadambini Ganguly - Indian physician, known for being the first South Asian female physician, trained in western medicine, to graduate in South Asia.',
  gates:
    'William Henry "Bill" Gates III is an American business magnate, philanthropist, investor, computer programmer, and inventor.',
  gauss:
    'Johann Carl Friedrich Gauss - German mathematician who made significant contributions to many fields, including number theory, algebra, statistics, analysis, differential geometry, geodesy, geophysics, mechanics, electrostatics, magnetic fields, astronomy, matrix theory, and optics.',
  germain:
    'Marie-Sophie Germain - French mathematician, physicist and philosopher. Known for her work on elasticity theory, number theory and philosophy.',
  goldberg:
    'Adele Goldberg, was one of the designers and developers of the Smalltalk language.',
  goldstine:
    'Adele Goldstine, born Adele Katz, wrote the complete technical description for the first electronic digital computer, ENIAC.',
  goldwasser:
    'Shafi Goldwasser is a computer scientist known for creating theoretical foundations of modern cryptography. Winner of 2012 ACM Turing Award.',
  golick: 'James Golick, all around gangster.',
  goodall:
    "Jane Goodall - British primatologist, ethologist, and anthropologist who is considered to be the world's foremost expert on chimpanzees.",
  gould:
    'Stephen Jay Gould was was an American paleontologist, evolutionary biologist, and historian of science. He is most famous for the theory of punctuated equilibrium.',
  greider:
    'Carolyn Widney Greider - American molecular biologist and joint winner of the 2009 Nobel Prize for Physiology or Medicine for the discovery of telomerase.',
  grothendieck:
    'Alexander Grothendieck - German-born French mathematician who became a leading figure in the creation of modern algebraic geometry.',
  haibt:
    'Lois Haibt - American computer scientist, part of the team at IBM that developed FORTRAN.',
  hamilton:
    'Margaret Hamilton - Director of the Software Engineering Division of the MIT Instrumentation Laboratory, which developed on-board flight software for the Apollo space program.',
  haslett:
    "Caroline Harriet Haslett - English electrical engineer, electricity industry administrator and champion of women's rights. Co-author of British Standard 1363 that specifies AC power plugs and sockets used across the United Kingdom (which is widely considered as one of the safest designs).",
  hawking:
    'Stephen Hawking pioneered the field of cosmology by combining general relativity and quantum mechanics.',
  hellman:
    'Martin Edward Hellman - American cryptologist, best known for his invention of public-key cryptography in co-operation with Whitfield Diffie and Ralph Merkle.',
  heisenberg: 'Werner Heisenberg was a founding father of quantum mechanics.',
  hermann:
    'Grete Hermann was a German philosopher noted for her philosophical work on the foundations of quantum mechanics.',
  herschel:
    'Caroline Lucretia Herschel - German astronomer and discoverer of several comets.',
  hertz:
    'Heinrich Rudolf Hertz - German physicist who first conclusively proved the existence of the electromagnetic waves.',
  heyrovsky:
    'Jaroslav Heyrovský was the inventor of the polarographic method, father of the electroanalytical method, and recipient of the Nobel Prize in 1959. His main field of work was polarography.',
  hodgkin:
    'Dorothy Hodgkin was a British biochemist, credited with the development of protein crystallography. She was awarded the Nobel Prize in Chemistry in 1964.',
  hofstadter:
    'Douglas R. Hofstadter is an American professor of cognitive science and author of the Pulitzer Prize and American Book Award-winning work Goedel, Escher, Bach: An Eternal Golden Braid in 1979. A mind-bending work which coined Hofstadter\'s Law: "It always takes longer than you expect, even when you take into account Hofstadter\'s Law.".',
  hoover:
    'Erna Schneider Hoover revolutionized modern communication by inventing a computerized telephone switching method.',
  hopper:
    'Grace Hopper developed the first compiler for a computer programming language and  is credited with popularizing the term "debugging" for fixing computer glitches.',
  hugle:
    'Frances Hugle, she was an American scientist, engineer, and inventor who contributed to the understanding of semiconductors, integrated circuitry, and the unique electrical principles of microscopic materials.',
  hypatia:
    'Hypatia - Greek Alexandrine Neoplatonist philosopher in Egypt who was one of the earliest mothers of mathematics.',
  ishizaka:
    'Teruko Ishizaka - Japanese scientist and immunologist who co-discovered the antibody class Immunoglobulin E.',
  jackson:
    "Mary Jackson, American mathematician and aerospace engineer who earned the highest title within NASA's engineering department.",
  jang: 'Yeong-Sil Jang was a Korean scientist and astronomer during the Joseon Dynasty; he invented the first metal printing press and water gauge.',
  jemison:
    'Mae Carol Jemison -  is an American engineer, physician, and former NASA astronaut. She became the first black woman to travel in space when she served as a mission specialist aboard the Space Shuttle Endeavour.',
  jennings: 'Betty Jennings - one of the original programmers of the ENIAC.',
  jepsen:
    'Mary Lou Jepsen, was the founder and chief technology officer of One Laptop Per Child (OLPC), and the founder of Pixel Qi.',
  johnson:
    'Katherine Coleman Goble Johnson - American physicist and mathematician contributed to the NASA.',
  joliot:
    'Irène Joliot-Curie - French scientist who was awarded the Nobel Prize for Chemistry in 1935. Daughter of Marie and Pierre Curie.',
  jones:
    'Karen Spärck Jones came up with the concept of inverse document frequency, which is used in most search engines today.',
  kalam:
    'A. P. J. Abdul Kalam - is an Indian scientist aka Missile Man of India for his work on the development of ballistic missile and launch vehicle technology.',
  kapitsa:
    'Sergey Petrovich Kapitsa (Russian: Серге́й Петро́вич Капи́ца; 14 February 1928 – 14 August 2012) was a Russian physicist and demographer. He was best known as host of the popular and long-running Russian scientific TV show, Evident, but Incredible. His father was the Nobel laureate Soviet-era physicist Pyotr Kapitsa, and his brother was the geographer and Antarctic explorer Andrey Kapitsa.',
  kare: 'Susan Kare, created the icons and many of the interface elements for the original Apple Macintosh in the 1980s, and was an original employee of NeXT, working as the Creative Director.',
  keldysh:
    'Mstislav Keldysh - a Soviet scientist in the field of mathematics and mechanics, academician of the USSR Academy of Sciences (1946), President of the USSR Academy of Sciences (1961–1975), three times Hero of Socialist Labor (1956, 1961, 1971), fellow of the Royal Society of Edinburgh (1968).',
  keller:
    'Mary Kenneth Keller, Sister Mary Kenneth Keller became the first American woman to earn a PhD in Computer Science in 1965.',
  kepler:
    'Johannes Kepler, German astronomer known for his three laws of planetary motion.',
  khayyam:
    "Omar Khayyam - Persian mathematician, astronomer and poet. Known for his work on the classification and solution of cubic equations, for his contribution to the understanding of Euclid's fifth postulate and for computing the length of a year very accurately.",
  khorana:
    'Har Gobind Khorana - Indian-American biochemist who shared the 1968 Nobel Prize for Physiology.',
  kilby:
    'Jack Kilby invented silicon integrated circuits and gave Silicon Valley its name.',
  kirch: 'Maria Kirch - German astronomer and first woman to discover a comet.',
  knuth:
    'Donald Knuth - American computer scientist, author of "The Art of Computer Programming" and creator of the TeX typesetting system.',
  kowalevski:
    'Sophie Kowalevski - Russian mathematician responsible for important original contributions to analysis, differential equations and mechanics.',
  lalande:
    'Marie-Jeanne de Lalande - French astronomer, mathematician and cataloguer of stars.',
  lamarr:
    'Hedy Lamarr - Actress and inventor. The principles of her work are now incorporated into modern Wi-Fi, CDMA and Bluetooth technology.',
  lamport:
    'Leslie B. Lamport - American computer scientist. Lamport is best known for his seminal work in distributed systems and was the winner of the 2013 Turing Award.',
  leakey:
    'Mary Leakey - British paleoanthropologist who discovered the first fossilized Proconsul skull.',
  leavitt:
    'Henrietta Swan Leavitt - she was an American astronomer who discovered the relation between the luminosity and the period of Cepheid variable stars.',
  lederberg:
    'Esther Miriam Zimmer Lederberg - American microbiologist and a pioneer of bacterial genetics.',
  kaminskaia:
    'Elena Kaminskaia – the best girlfriend who inspires creativity –.',
  lehmann:
    'Inge Lehmann - Danish seismologist and geophysicist. Known for discovering in 1936 that the Earth has a solid inner core inside a molten outer core.',
  lewin:
    'Daniel Lewin - Mathematician, Akamai co-founder, soldier, 9/11 victim-- Developed optimization techniques for routing traffic on the internet. Died attempting to stop the 9-11 hijackers.',
  lichterman: 'Ruth Lichterman - one of the original programmers of the ENIAC.',
  liskov:
    'Barbara Liskov - co-developed the Liskov substitution principle. Liskov was also the winner of the Turing Prize in 2008.',
  lovelace: 'Ada Lovelace invented the first algorithm.',
  lumiere: 'Auguste and Louis Lumière - the first filmmakers in history.',
  mahavira:
    'Mahavira - Ancient Indian mathematician during 9th century AD who discovered basic algebraic identities.',
  margulis:
    'Lynn Margulis (b. Lynn Petra Alexander) - an American evolutionary theorist and biologist, science author, educator, and popularizer, and was the primary modern proponent for the significance of symbiosis in evolution.',
  matsumoto:
    'Yukihiro Matsumoto - Japanese computer scientist and software programmer best known as the chief designer of the Ruby programming language.',
  maxwell:
    'James Clerk Maxwell - Scottish physicist, best known for his formulation of electromagnetic theory.',
  mayer:
    'Maria Mayer - American theoretical physicist and Nobel laureate in Physics for proposing the nuclear shell model of the atomic nucleus.',
  mccarthy: 'John McCarthy invented LISP.',
  mcclintock:
    'Barbara McClintock - a distinguished American cytogeneticist, 1983 Nobel Laureate in Physiology or Medicine for discovering transposons.',
  mclaren:
    'Anne Laura Dorinthea McLaren - British developmental biologist whose work helped lead to human in-vitro fertilisation.',
  mclean: 'Malcolm McLean invented the modern shipping container.',
  mcnulty: 'Kay McNulty - one of the original programmers of the ENIAC.',
  mendel: 'Gregor Johann Mendel - Czech scientist and founder of genetics.',
  mendeleev:
    'Dmitri Mendeleev - a chemist and inventor. He formulated the Periodic Law, created a farsighted version of the periodic table of elements, and used it to correct the properties of some already discovered elements and also to predict the properties of eight elements yet to be discovered.',
  meitner:
    'Lise Meitner - Austrian/Swedish physicist who was involved in the discovery of nuclear fission. The element meitnerium is named after her.',
  meninsky:
    "Carla Meninsky, was the game designer and programmer for Atari 2600 games Dodge 'Em and Warlords.",
  merkle:
    "Ralph C. Merkle - American computer scientist, known for devising Merkle's puzzles - one of the very first schemes for public-key cryptography. Also, inventor of Merkle trees and co-inventor of the Merkle-Damgård construction for building collision-resistant cryptographic hash functions and the Merkle-Hellman knapsack cryptosystem.",
  mestorf:
    'Johanna Mestorf - German prehistoric archaeologist and first female museum director in Germany.',
  mirzakhani:
    'Maryam Mirzakhani - an Iranian mathematician and the first woman to win the Fields Medal.',
  montalcini:
    'Rita Levi-Montalcini - Won Nobel Prize in Physiology or Medicine jointly with colleague Stanley Cohen for the discovery of nerve growth factor (.',
  moore:
    "Gordon Earle Moore - American engineer, Silicon Valley founding father, author of Moore's law.",
  morse:
    'Samuel Morse - contributed to the invention of a single-wire telegraph system based on European telegraphs and was a co-developer of the Morse code.',
  murdock: 'Ian Murdock - founder of the Debian project.',
  moser:
    'May-Britt Moser - Nobel prize winner neuroscientist who contributed to the discovery of grid cells in the brain.',
  napier:
    'John Napier of Merchiston - Scottish landowner known as an astronomer, mathematician and physicist. Best known for his discovery of logarithms.',
  nash: 'John Forbes Nash, Jr. - American mathematician who made fundamental contributions to game theory, differential geometry, and the study of partial differential equations.',
  neumann:
    'John von Neumann - todays computer architectures are based on the von Neumann architecture.',
  newton: 'Isaac Newton invented classic mechanics and modern optics.',
  nightingale:
    'Florence Nightingale, more prominently known as a nurse, was also the first female member of the Royal Statistical Society and a pioneer in statistical graphics.',
  nobel:
    'Alfred Nobel - a Swedish chemist, engineer, innovator, and armaments manufacturer (inventor of dynamite).',
  noether:
    "Emmy Noether, German mathematician. Noether's Theorem is named after her.",
  northcutt:
    'Poppy Northcutt. Poppy Northcutt was the first woman to work as part of NASA’s Mission Control.',
  noyce:
    'Robert Noyce invented silicon integrated circuits and gave Silicon Valley its name.',
  panini:
    "Panini - Ancient Indian linguist and grammarian from 4th century CE who worked on the world's first formal system.",
  pare: 'Ambroise Pare invented modern surgery.',
  pascal: 'Blaise Pascal, French mathematician, physicist, and inventor.',
  pasteur:
    'Louis Pasteur discovered vaccination, fermentation and pasteurization.',
  payne:
    'Cecilia Payne-Gaposchkin was an astronomer and astrophysicist who, in 1925, proposed in her Ph.D. thesis an explanation for the composition of stars in terms of the relative abundances of hydrogen and helium.',
  perlman:
    'Radia Perlman is a software designer and network engineer and most famous for her invention of the spanning-tree protocol (STP).',
  pike: 'Rob Pike was a key contributor to Unix, Plan 9, the X graphic system, utf-8, and the Go programming language.',
  poincare:
    'Henri Poincaré made fundamental contributions in several fields of mathematics.',
  poitras:
    'Laura Poitras is a director and producer whose work, made possible by open source crypto tools, advances the causes of truth and freedom of information by reporting disclosures by whistleblowers such as Edward Snowden.',
  proskuriakova:
    'Tat’yana Avenirovna Proskuriakova (Russian: Татья́на Авени́ровна Проскуряко́ва) (January 23 [O.S. January 10] 1909 – August 30, 1985) was a Russian-American Mayanist scholar and archaeologist who contributed significantly to the deciphering of Maya hieroglyphs, the writing system of the pre-Columbian Maya civilization of Mesoamerica.',
  ptolemy:
    'Claudius Ptolemy - a Greco-Egyptian writer of Alexandria, known as a mathematician, astronomer, geographer, astrologer, and poet of a single epigram in the Greek Anthology.',
  raman:
    'C. V. Raman - Indian physicist who won the Nobel Prize in 1930 for proposing the Raman effect.',
  ramanujan:
    'Srinivasa Ramanujan - Indian mathematician and autodidact who made extraordinary contributions to mathematical analysis, number theory, infinite series, and continued fractions.',
  ride: 'Sally Kristen Ride was an American physicist and astronaut. She was the first American woman in space, and the youngest American astronaut.',
  ritchie:
    'Dennis Ritchie - co-creator of UNIX and the C programming language.',
  rhodes:
    'Ida Rhodes - American pioneer in computer programming, designed the first computer used for Social Security.',
  robinson:
    'Julia Hall Bowman Robinson - American mathematician renowned for her contributions to the fields of computability theory and computational complexity theory.',
  roentgen:
    'Wilhelm Conrad Röntgen - German physicist who was awarded the first Nobel Prize in Physics in 1901 for the discovery of X-rays (Röntgen rays).',
  rosalind:
    'Rosalind Franklin - British biophysicist and X-ray crystallographer whose research was critical to the understanding of DNA.',
  rubin:
    'Vera Rubin - American astronomer who pioneered work on galaxy rotation rates.',
  saha: 'Meghnad Saha - Indian astrophysicist best known for his development of the Saha equation, used to describe chemical and physical conditions in stars.',
  sammet:
    'Jean E. Sammet developed FORMAC, the first widely used computer language for symbolic manipulation of mathematical formulas.',
  sanderson:
    "Mildred Sanderson - American mathematician best known for Sanderson's theorem concerning modular invariants.",
  satoshi:
    "Satoshi Nakamoto is the name used by the unknown person or group of people who developed bitcoin, authored the bitcoin white paper, and created and deployed bitcoin's original reference implementation.",
  shamir:
    "Adi Shamir - Israeli cryptographer whose numerous inventions and contributions to cryptography include the Ferge Fiat Shamir identification scheme, the Rivest Shamir Adleman (RSA) public-key cryptosystem, the Shamir's secret sharing scheme, the breaking of the Merkle-Hellman cryptosystem, the TWINKLE and TWIRL factoring devices and the discovery of differential cryptanalysis (with Eli Biham).",
  shannon:
    'Claude Shannon - The father of information theory and founder of digital circuit design theory. (.',
  shaw: 'Carol Shaw - Originally an Atari employee, Carol Shaw is said to be the first female video game designer.',
  shirley:
    'Dame Stephanie "Steve" Shirley - Founded a software company in 1962 employing women working from home.',
  shockley: 'William Shockley co-invented the transistor.',
  shtern:
    'Lina Solomonovna Stern (or Shtern; Russian: Лина Соломоновна Штерн; 26 August 1878 – 7 March 1968) was a Soviet biochemist, physiologist and humanist whose medical discoveries saved thousands of lives at the fronts of World War II. She is best known for her pioneering work on blood–brain barrier, which she described as hemato-encephalic barrier in 1921.',
  sinoussi:
    'Françoise Barré-Sinoussi - French virologist and Nobel Prize Laureate in Physiology or Medicine; her work was fundamental in identifying HIV as the cause of AIDS.',
  snyder: 'Betty Snyder - one of the original programmers of the ENIAC.',
  solomon:
    'Cynthia Solomon - Pioneer in the fields of artificial intelligence, computer science and educational computing. Known for creation of Logo, an educational programming language.',
  spence: 'Frances Spence - one of the original programmers of the ENIAC.',
  stonebraker:
    'Michael Stonebraker is a database research pioneer and architect of Ingres, Postgres, VoltDB and SciDB. Winner of 2014 ACM Turing Award.',
  sutherland:
    'Ivan Edward Sutherland - American computer scientist and Internet pioneer, widely regarded as the father of computer graphics.',
  swanson:
    'Janese Swanson (with others) developed the first of the Carmen Sandiego games. She went on to found Girl Tech.',
  swartz:
    'Aaron Swartz was influential in creating RSS, Markdown, Creative Commons, Reddit, and much of the internet as we know it today. He was devoted to freedom of information on the web.',
  swirles:
    'Bertha Swirles was a theoretical physicist who made a number of contributions to early quantum theory.',
  taussig:
    'Helen Brooke Taussig - American cardiologist and founder of the field of paediatric cardiology.',
  tesla:
    'Nikola Tesla invented the AC electric system and every gadget ever used by a James Bond villain.',
  tharp:
    'Marie Tharp - American geologist and oceanic cartographer who co-created the first scientific map of the Atlantic Ocean floor. Her work led to the acceptance of the theories of plate tectonics and continental drift.',
  thompson: 'Ken Thompson - co-creator of UNIX and the C programming language.',
  torvalds: 'Linus Torvalds invented Linux and Git.',
  tu: 'Youyou Tu - Chinese pharmaceutical chemist and educator known for discovering artemisinin and dihydroartemisinin, used to treat malaria, which has saved millions of lives. Joint winner of the 2015 Nobel Prize in Physiology or Medicine.',
  turing: 'Alan Turing was a founding father of computer science.',
  varahamihira:
    'Varahamihira - Ancient Indian mathematician who discovered trigonometric formulae during 505-587 CE.',
  vaughan:
    "Dorothy Vaughan was a NASA mathematician and computer programmer on the SCOUT launch vehicle program that put America's first satellites into space.",
  villani:
    'Cédric Villani - French mathematician, won Fields Medal, Fermat Prize and Poincaré Price for his work in differential geometry and statistical mechanics.',
  visvesvaraya:
    "Sir Mokshagundam Visvesvaraya - is a notable Indian engineer.  He is a recipient of the Indian Republic's highest honour, the Bharat Ratna, in 1955. On his birthday, 15 September is celebrated as Engineer's Day in India in his memory.",
  volhard:
    'Christiane Nüsslein-Volhard - German biologist, won Nobel Prize in Physiology or Medicine in 1995 for research on the genetic control of embryonic development.',
  wescoff: 'Marlyn Wescoff - one of the original programmers of the ENIAC.',
  wilbur:
    'Sylvia B. Wilbur - British computer scientist who helped develop the ARPANET, was one of the first to exchange email in the UK and a leading researcher in computer-supported collaborative work.',
  wiles:
    "Andrew Wiles - Notable British mathematician who proved the enigmatic Fermat's Last Theorem.",
  williams:
    "Roberta Williams, did pioneering work in graphical adventure games for personal computers, particularly the King's Quest series.",
  williamson:
    'Malcolm John Williamson - British mathematician and cryptographer employed by the GCHQ. Developed in 1974 what is now known as Diffie-Hellman key exchange (Diffie and Hellman first published the scheme in 1976).',
  wilson:
    'Sophie Wilson designed the first Acorn Micro-Computer and the instruction set for ARM processors.',
  wing: 'Jeannette Wing - co-developed the Liskov substitution principle.',
  wozniak: 'Steve Wozniak invented the Apple I and Apple II.',
  wright:
    "The Wright brothers, Orville and Wilbur - credited with inventing and building the world's first successful airplane and making the first controlled, powered and sustained heavier-than-air human flight.",
  wu: 'Chien-Shiung Wu - Chinese-American experimental physicist who made significant contributions to nuclear physics.',
  yalow:
    'Rosalyn Sussman Yalow - Rosalyn Sussman Yalow was an American medical physicist, and a co-winner of the 1977 Nobel Prize in Physiology or Medicine for development of the radioimmunoassay technique.',
  yonath:
    'Ada Yonath - an Israeli crystallographer, the first woman from the Middle East to win a Nobel prize in the sciences.',
  zhukovsky:
    'Nikolay Yegorovich Zhukovsky (Russian: Никола́й Его́рович Жуко́вский, January 17 1847 – March 17, 1921) was a Russian scientist, mathematician and engineer, and a founding father of modern aero- and hydrodynamics. Whereas contemporary scientists scoffed at the idea of human flight, Zhukovsky was the first to undertake the study of airflow. He is often called the Father of Russian Aviation.',
  zhuravlev: 'Vladimir Zhuravlev – WavesDucks Founder and Awesome Guy',
  ivanov: 'Sasha Ivanov – Waves Protocol Founder',
  leonov: 'Waves Ducks Wars Developer',
  nakamoto: 'Satoshi Nakamoto – Bitcoin Founder',
  buterin: 'Vitalik Buterin – Ethereum Co-founder',
  nazarov: 'Sergey Nazarov – ChainLink Founder',
  zhao: 'CZ – Binance Founder',
  yakovenko: 'Anatoly Yakovenko – Solana Founder',
  gun: 'Emin Gun Sirer – Avalanche Funder',
  khomenko:
    'Oleg Khomenko – Waves Ducks Community Member who helped with maths',
  pichulin:
    'Dmitry Pichulin – Waves Ducks Community Member and Security Researcher who reviewed WavesDucks smart contracts',
  'van de Camp':
    'Rob van de Camp – Duxplorer.com Creator and WavesDucks Early Adopter',
  badrtdinov:
    'Artem Badrtdinov – Waves Ducks Community Member and Security Researcher who reviewed WavesDucks smart contracts',
  kardan: 'Inal Kardan – Waves Ducks CTO',
};
