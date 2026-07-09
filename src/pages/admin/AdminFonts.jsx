import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../../context/SettingsContext.jsx'
import { Search, Check } from 'lucide-react'

// A curated list of 200+ popular Google Fonts covering all styles.
// The font picker loads any of these on demand with live preview.
const FONT_LIST = [
  // Sans-serif
  'DM Sans', 'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Lato', 'Nunito', 'Raleway', 'Ubuntu',
  'Work Sans', 'Mulish', 'Manrope', 'Rubik', 'Heebo', 'Barlow', 'Hind', 'Karla', 'Oxygen', 'Cabin',
  'Quicksand', 'Mukti', 'Fira Sans', 'Source Sans 3', 'Noto Sans', 'PT Sans', 'Asap', 'Bitter', 'Carme', 'Chivo',
  'Cousine', 'David Libre', 'Dosis', 'Exo 2', 'Francois One', 'Gudea', 'Hanken Grotesk', 'IBM Plex Sans', 'Inconsolata', 'Jost',
  'Kanit', 'Khand', 'Krub', 'Lexend', 'Mada', 'Martel', 'Maven Pro', 'Merriweather Sans', 'Mitr', 'Molengo',
  'Mplus 1p', 'NTR', 'Neuton', 'Nunito Sans', 'Offside', 'Orienta', 'Overpass', 'Palanquin', 'Pathway Gothic One', 'Perpetua',
  'Poppins', 'Pragati Narrow', 'Proza Libre', 'Quattrocento Sans', 'Questrial', 'Rajdhani', 'Saira', 'Sarala', 'Sarina', 'Sarpanch',
  'Scope One', 'Signika', 'Sintony', 'Sora', 'Spectral', 'Spinnaker', 'Sree Krushnadevaraya', 'Sriracha', 'Suez One', 'Sumana',
  'Sunflower', 'Tauri', 'Taviraj', 'Tinos', 'Titillium Web', 'Trirong', 'Trocchi', 'Trocchi', 'Trykker', 'Ubuntu Condensed',
  'Varela Round', 'Varta', 'Vollkorn', 'Wendy One', 'Wire One', 'Yanone Kaffeesatz', 'Yrsa', 'ZCOOL XiaoWei', 'Zilla Slab', 'Zilla Slab Highlight',
  // Serif
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Cormorant', 'Crimson Text', 'EB Garamond', 'Libre Baskerville', 'Source Serif 4', 'Noto Serif',
  'Bree Serif', 'Cinzel', 'Domine', 'Frank Ruhl Libre', 'Gilda Display', 'Glegoo', 'Gloock', 'Halant', 'Harmattan', 'Inika',
  'Josefin Slab', 'Judson', 'Kadwa', 'Kalam', 'Karma', 'Kavivanar', 'Kite One', 'Kotta One', 'Krona One', 'Kurale',
  'Ledger', 'Lekton', 'Libre Franklin', 'Lustria', 'Magra', 'Maitree', 'Marcellus', 'Markazi Text', 'Marmelad', 'Martel Sans',
  'Mate', 'Mate SC', 'Maven', 'Meddon', 'MedievalSharp', 'Medula One', 'Merienda', 'Merriweather', 'Miltonian', 'Miltonian Tattoo',
  'Miniver', 'Miriam Libre', 'Mitr', 'Modak', 'Modak', 'Molengo', 'Molle', 'Monda', 'Monoton', 'Monsieur La Doulaise',
  'Montaga', 'Montez', 'Montserrat', 'Mountains of Christmas', 'Mr Dafoe', 'Mr De Haviland', 'Mrs Saint Delafield', 'Mrs Sheppards', 'Mukta', 'Mukta Mahee',
  'Mukta Malar', 'Mukta Vaani', 'MuseoModerno', 'My Soul', 'Nanum Myeongjo', 'Nanum Pen Script', 'Nanum Brush Script', 'Neonderthal', 'Nerko One', 'Neuton',
  'Newsreader', 'Niconne', 'Nixie One', 'Nobile', 'Norican', 'Nosifer', 'Notable', 'Noto Serif Display', 'Noto Serif JP', 'Noto Serif KR',
  // Display / Streetwear
  'Anton', 'Bebas Neue', 'Oswald', 'Archivo Black', 'Russo One', 'Staatliches', 'Teko', 'Saira Condensed', 'Abel', 'Advent Pro',
  'Audiowide', 'Black Ops One', 'Bungee', 'Bungee Inline', 'Bungee Shade', 'Cabin Sketch', 'Carter One', 'Caveat', 'Caveat Brush', 'Chango',
  'Chau Philomene One', 'Cherry Bomb One', 'Chicle', 'Coda', 'Codystar', 'Combo', 'Comfortaa', 'Concert One', 'Contrail One', 'Cookie',
  'Corben', 'Creepster', 'Croissant One', 'Damion', 'Dancing Script', 'Dangrek', 'Darker Grotesque', 'Dela Gothic One', 'Delius', 'Delius Swash Caps',
  'Delius Unicase', 'Diplomata', 'Diplomata SC', 'Do Hyeon', 'Dokdo', 'Dongle', 'Doppio One', 'Dr Sugiyama', 'Duru Sans', 'Dynalight',
  'Eater', 'Economica', 'Eczar', 'El Messiri', 'Electrolize', 'Elsie', 'Elsie Swash Caps', 'Emblema One', 'Emilys Candy', 'Engagement',
  'Englebert', 'Enriqueta', 'Epilogue', 'Erica One', 'Esteban', 'Euphoria Script', 'Ewert', 'Exo', 'Expletus Sans', 'Familjen Grotesk',
  'Fanwood Text', 'Faustina', 'Federant', 'Federo', 'Felipa', 'Fenix', 'Festive', 'Figtree', 'Finger Paint', 'Fira Code',
  'Fira Mono', 'Fjalla One', 'Fjord One', 'Flamenco', 'Flavors', 'Fondamento', 'Fontdiner Swanky', 'Forum', 'Faster One', 'Fasthand',
  'Fauna One', 'Fascinate', 'Fascinate Inline', 'Federant', 'Federo', 'Felipa', 'Fenix', 'Festive', 'Figtree', 'Finger Paint',
  // Monospace
  'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'Space Mono', 'IBM Plex Mono', 'Roboto Mono', 'Cousine', 'DM Mono', 'Anonymous Pro', 'Cutive Mono',
  // Handwriting / Script
  'Pacifico', 'Caveat', 'Dancing Script', 'Lobster', 'Permanent Marker', 'Shadows Into Light', 'Sacramento', 'Great Vibes', 'Satisfy', 'Allura',
  'Arizonia', 'Bad Script', 'Bilbo', 'Bilbo Swash Caps', 'Bonbon', 'Bowlby One', 'Bowlby One SC', 'Bree Serif', 'Bubblegum Sans', 'Bubbler One',
  'Calligraffitti', 'Cambo', 'Cantata One', 'Cantora One', 'Capriola', 'Cardo', 'Carme', 'Carrois Gothic', 'Carrois Gothic SC', 'Castoro',
  // Condensed / Urban
  'Archivo', 'Archivo Narrow', 'Barlow Condensed', 'Barlow Semi Condensed', 'Bebas Neue', 'Fjalla One', 'Oswald', 'PT Sans Narrow', 'Rajdhani', 'Saira Condensed',
  'Saira Semi Condensed', 'Saira Extra Condensed', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Titan One', 'Yanone Kaffeesatz', 'ZCOOL QingKe HuangYou', 'ZCOOL KuaiLe', 'Alfa Slab One', 'Almendra',
  'Almendra Display', 'Almendra SC', 'Amiri', 'Amita', 'Amita', 'Andada', 'Andika', 'Andada Pro', 'Anek Latin', 'Anek Malayalam',
  'Anek Tamil', 'Anek Telugu', 'Anek Devanagari', 'Anek Gujarati', 'Anek Gurmukhi', 'Anek Kannada', 'Anek Bengali', 'Anek Odia', 'Annie Use Your Telescope', 'Anonymous Pro',
  'Antic', 'Antic Didone', 'Antic Slab', 'Anton', 'Aoboshi One', 'Arapey', 'Arbutus', 'Arbutus Slab', 'Architects Daughter', 'Archivo',
  'Aref Ruqaa', 'Arima', 'Arima Madurai', 'Arima Madurai', 'Arima Madurai', 'Arsenal', 'Artifika', 'Arvo', 'Arya', 'Asap Condensed',
  'Asar', 'Asset', 'Assistant', 'Astloch', 'Asul', 'Athiti', 'Atkinson Hyperlegible', 'Atma', 'Atomic Age', 'Aubrey',
  'Audiowide', 'Autour One', 'Average', 'Average Sans', 'Averia Gruesa Libre', 'Averia Libre', 'Averia Sans Libre', 'Averia Serif Libre', 'B612', 'B612 Mono',
  'Bad Script', 'Bahiana', 'Bahianita', 'Bahnschrift', 'Bai Jamjuree', 'Baloo 2', 'Baloo Bhai 2', 'Baloo Bhaijaan 2', 'Baloo Bhaina 2', 'Baloo Chettan 2',
  'Baloo Da 2', 'Baloo Paaji 2', 'Baloo Tammudu 2', 'Baloo Tammil 2', 'Baloo Telugu 2', 'Baloo Thambi 2', 'Balsamiq Sans', 'Balthazar', 'Bangers', 'Barlow',
  'Barlow Condensed', 'Barlow Semi Condensed', 'Basic', 'Baskervville', 'Battambang', 'Baumans', 'Bayon', 'Be Vietnam Pro', 'Bevan', 'Bebas Neue',
  'Belgrano', 'Bellota', 'Bellota Text', 'BenchNine', 'Beirut', 'Bentham', 'Berkshire Swash', 'Beth Ellen', 'Bevan', 'Big Shoulders Display',
  'Big Shoulders Inline Display', 'Big Shoulders Inline Text', 'Big Shoulders Stencil Display', 'Big Shoulders Stencil Text', 'Big Shoulders Text', 'Bigshot One', 'Bilbo', 'Bilbo Swash Caps', 'BioRhyme', 'BioRhyme Expanded',
  'Bitter', 'Black And White Picture', 'Black Han Sans', 'Black Ops One', 'Blaka', 'Blaka Hollow', 'Blaka Ink', 'Blinker', 'Bodoni Moda', 'Bokor',
  'Bonbon', 'Bonheur Royale', 'Boogaloo', 'Bowlby One', 'Bowlby One SC', 'Brawler', 'Bree Serif', 'Bricolage Grotesque', 'Bruno Ace', 'Bruno Ace SC',
  'Brygada 1918', 'Bubbler One', 'Buda', 'Buda Light', 'Buenard', 'Bungee', 'Bungee Hairline', 'Bungee Inline', 'Bungee Outline', 'Bungee Shade',
  'Butcherman', 'Butterfly Kids', 'Cabin', 'Cabin Condensed', 'Cabin Sketch', 'Caesar Dressing', 'Cagliostro', 'Cairo', 'Caladea', 'Calistoga',
  'Calligraffitti', 'Cambay', 'Cambo', 'Cantata One', 'Cantora One', 'Caprasimo', 'Capriola', 'Caramel', 'Carattere', 'Cardo',
  'Carlito', 'Carme', 'Carrois Gothic', 'Carrois Gothic SC', 'Cartoonist', 'Carter One', 'Cascadia Code', 'Castoro', 'Castoro Titling', 'Catamaran',
  'Caudex', 'Caveat', 'Caveat Brush', 'Cedarville Cursive', 'Ceviche One', 'Chakra Petch', 'Changa', 'Changa One', 'Chango', 'Charm',
  'Charmonman', 'Chathura', 'Chau Philomene One', 'Chela One', 'Chelsea Market', 'Chenla', 'Cherry Bomb One', 'Cherry Cream Soda', 'Cherry Swash', 'Chewy',
  'Chicle', 'Chiflon', 'Chivo', 'Chivo Mono', 'Chokokutai', 'Chonburi', 'Cinzel', 'Cinzel Decorative', 'Clicker Script', 'Coda',
  'Coda Caption', 'Codystar', 'Coiny', 'Combo', 'Comfortaa', 'Comic Neue', 'Comic Sans MS', 'Coming Soon', 'Commissioner', 'Concert One',
  'Condiment', 'Content', 'Contrail One', 'Convergence', 'Cookie', 'Copse', 'Corben', 'Corinthia', 'Cormorant', 'Cormorant Garamond',
  'Cormorant Infant', 'Cormorant SC', 'Cormorant Unicase', 'Cormorant Upright', 'Coronets', 'Courgette', 'Courier Prime', 'Cousine', 'Coustard', 'Covered By Your Grace',
  'Crafty Girls', 'Creepster', 'Crete Round', 'Crimson Pro', 'Crimson Text', 'Crispy', 'Croissant One', 'Crushed', 'Cuprum', 'Cute Font',
  'Cutive', 'Cutive Mono', 'Dancing Script', 'Dangrek', 'Darker Grotesque', 'David Libre', 'Dawning of a New Day', 'Days One', 'Dekko', 'Dela Gothic One',
  'Delius', 'Delius Swash Caps', 'Delius Unicase', 'Della Respira', 'Denk One', 'Devonshire', 'Dhurjati', 'Didact Gothic', 'Diphylleia', 'Diplomata',
  'Diplomata SC', 'Do Hyeon', 'Dokdo', 'Dongle', 'Doppio One', 'Dorsa', 'Dosis', 'DotGothic16', 'Dr Sugiyama', 'Duru Sans',
  'Dynalight', 'EB Garamond', 'Eagle Lake', 'East Sea Dokdo', 'Eater', 'Economica', 'Eczar', 'El Messiri', 'Electrolize', 'Elsie',
  'Elsie Swash Caps', 'Emblema One', 'Emilys Candy', 'Encode Sans', 'Encode Sans Condensed', 'Encode Sans Expanded', 'Encode Sans Semi Condensed', 'Encode Sans Semi Expanded', 'Engagement', 'Englebert',
  'Enriqueta', 'Epilogue', 'Erica One', 'Esteban', 'Estonia', 'Euphoria Script', 'Ewert', 'Exo', 'Exo 2', 'Expletus Sans',
  'Fahkwang', 'Familjen Grotesk', 'Fanwood Text', 'Farro', 'Farsan', 'Faustina', 'Federant', 'Federo', 'Felipa', 'Fenix',
  'Festive', 'Figtree', 'Finger Paint', 'Finlandica', 'Fira Code', 'Fira Mono', 'Fira Sans', 'Fira Sans Condensed', 'Fira Sans Extra Condensed', 'Fjalla One',
  'Fjord One', 'Flamenco', 'Flavors', 'Fondamento', 'Fontdiner Swanky', 'Forum', 'Francois One', 'Frank Ruhl Libre', 'Fraunces', 'Fresca',
  'Frijole', 'Fruktur', 'Fugaz One', 'Fuggles', 'GFS Didot', 'GFS Neohellenic', 'Gabriela', 'Gaegu', 'Gafata', 'Galada',
  'Galdeano', 'Galindo', 'Gamja Flower', 'Gantari', 'Gasoek One', 'Gayathri', 'Gelasio', 'Gemunu Libre', 'Genos', 'Gentium Basic',
  'Gentium Plus', 'Geo', 'Georama', 'Geostar', 'Geostar Fill', 'Germania One', 'Gideon Roman', 'Gilda Display', 'Girassol', 'Give You Glory',
  'Glass Antiqua', 'Glegoo', 'Gloock', 'Gloria Hallelujah', 'Gloock', 'Gochi Hand', 'Goldman', 'Gorditas', 'Gothic A1', 'Gotu',
  'Goudy Bookletter 1911', 'Gowun Batang', 'Gowun Dodum', 'Graduate', 'Grand Hotel', 'Grandiflora One', 'Grandstander', 'Grape Nuts', 'Gravitas One', 'Great Vibes',
  'Grechen Fuehren', 'Grenze', 'Grenze Gotisch', 'Grey Qo', 'Griffy', 'Gruppo', 'Gudea', 'Gugi', 'Gulzar', 'Gupter',
  'Gurajada', 'Gwendolyn', 'Habibi', 'Hahmlet', 'Halant', 'Hammersmith One', 'Hanalei', 'Hanalei Fill', 'Handjet', 'Handlee',
  'Hanken Grotesk', 'Hanuman', 'Happy Monkey', 'Harmattan', 'Headland One', 'Heebo', 'Hepta Slab', 'Herr Von Muellerhoff', 'Hi Melody', 'Hina Minako',
  'Hind', 'Hind Guntur', 'Hind Madurai', 'Hind Siliguri', 'Hind Vadodara', 'Holtwood One SC', 'Homemade Apple', 'Homenaje', 'Hubballi', 'Hurricane',
  'IBM Plex Mono', 'IBM Plex Sans', 'IBM Plex Sans Arabic', 'IBM Plex Sans Condensed', 'IBM Plex Serif', 'IBM Plex Sans Devanagari', 'IBM Plex Sans KR', 'IBM Plex Sans JP', 'IBM Plex Sans TC', 'IBM Plex Sans SC',
  'Iceland', 'Imprima', 'Inconsolata', 'Inder', 'Indie Flower', 'Ingrid', 'Inika', 'Inknut Antiqua', 'Inria Sans', 'Inria Serif',
  'Inspiration', 'Inter', 'Inter Tight', 'Irish Grover', 'Island Moments', 'Istok Web', 'Italiana', 'Italianno', 'Itim', 'Jacques Francois',
  'Jacques Francois Shadow', 'Jaldi', 'JetBrains Mono', 'Jim Nightshade', 'Jockey One', 'Jolly Lodger', 'Jomhuria', 'Jomolhari', 'Josefin Sans', 'Josefin Slab',
  'Jost', 'Joti One', 'Judson', 'Julee', 'Julius Sans One', 'Junge', 'Jura', 'Just Another Hand', 'Just Me Again Down Here', 'K2D',
  'Kablammo', 'Kadwa', 'Kalam', 'Kalam Light', 'Kalnia', 'Kameron', 'Kanit', 'Kantumruy Pro', 'Karantina', 'Karla',
  'Karma', 'Katibeh', 'Kavivanar', 'Kavoon', 'Kayo', 'Kdam Thmor Pro', 'Keania One', 'Kelly Slab', 'Kenia', 'Khand',
  'Khmer', 'Khula', 'Kings', 'Kirang Haerang', 'Kite One', 'Kiwi Maru', 'Klee One', 'Knewave', 'KoHo', 'Kodchasan',
  'Koh Santepheap', 'Kolker Brush', 'Kosugi', 'Kosugi Maru', 'Kotta One', 'Koulen', 'Kranky', 'Kreon', 'Kristi', 'Krona One',
  'Krub', 'Kufam', 'Kulim Park', 'Kumar One', 'Kumar One Outline', 'Kumbh Sans', 'Kurale', 'Kurosh', 'Kuroneko', 'Kurri',
  'La Belle Aurore', 'Labrada', 'Lacquer', 'Laila', 'Lalezar', 'Lancelot', 'Langar', 'Lateef', 'Lato', 'Lavish',
  'League Script', 'Ledger', 'Lekton', 'Lemon', 'Lemonada', 'Lexend', 'Lexend Deca', 'Lexend Exa', 'Lexend Giga', 'Lexend Mega',
  'Lexend Peta', 'Lexend Tera', 'Lexend Zetta', 'Libre Barcode 128', 'Libre Barcode 39', 'Libre Barcode 39 Extended', 'Libre Barcode 39 Text', 'Libre Baskerville', 'Libre Caslon Display', 'Libre Caslon Text',
  'Libre Franklin', 'Lifesavers', 'Lilita One', 'Lily Script One', 'Limelight', 'Linden Hill', 'Lisu Bidi', 'Literata', 'Liu Jian Mao Cao', 'Lobster',
  'Lobster Two', 'Londrina Outline', 'Londrina Shadow', 'Londrina Sketch', 'Londrina Solid', 'Long Cang', 'Lora', 'Love Light', 'Love Ya Like A Sister', 'Loved by the King',
  'Lovers Quarrel', 'Luckiest Guy', 'Lusitana', 'Lustria', 'Luxurious Roman', 'Luxurious Script', 'M PLUS 1', 'M PLUS 1 Code', 'M PLUS 1p', 'M PLUS 2',
  'M PLUS Rounded 1c', 'Ma Shan Zheng', 'Macondo', 'Macondo Swash Caps', 'Mada', 'Magra', 'Maiden Orange', 'Maitree', 'Major Mono Display', 'Mako',
  'Mali', 'Mallanna', 'Mandali', 'Manjari', 'Manrope', 'Mansalva', 'Manuale', 'Marcellus', 'Marcellus SC', 'Marcellus',
  'Marck Script', 'Margarine', 'Marhey', 'Markazi Text', 'Marko One', 'Marmelad', 'Martel', 'Martel Sans', 'Martina', 'Marvel',
  'Mate', 'Mate SC', 'Material Icons', 'Material Icons Outlined', 'Material Icons Round', 'Material Icons Sharp', 'Material Symbols', 'Maven Pro', 'McLaren', 'Mea Culpa',
  'Meddon', 'MedievalSharp', 'Medula One', 'Meera Inimai', 'Megrim', 'Meie Script', 'Meow Script', 'Merienda', 'Merienda One', 'Merriweather',
  'Merriweather Sans', 'Metal', 'Metal Mania', 'Metamorphous', 'Metrophobic', 'Michroma', 'Midnight', 'Migr', 'Mihoyo', 'Milonga',
  'Miltonian', 'Miltonian Tattoo', 'Mina', 'Miniver', 'Miriam Libre', 'Miss Fajardose', 'Mitr', 'Modak', 'Modern Antiqua', 'Mogra',
  'Molengo', 'Molle', 'Monda', 'Monofett', 'Monoton', 'Monsieur La Doulaise', 'Montaga', 'Montez', 'Montserrat', 'Montserrat Alternates',
  'Montserrat Subrayada', 'Moo Lah Lah', 'Moon Dance', 'Mountains of Christmas', 'Mouse Memoirs', 'Mr Bedfort', 'Mr Dafoe', 'Mr De Haviland', 'Mr Morden', 'Mrs Saint Delafield',
  'Mrs Sheppards', 'Mukta', 'Mukta Mahee', 'Mukta Malar', 'Mukta Vaani', 'Mulish', 'Murecho', 'MuseoModerno', 'My Soul', 'Mynerve',
  'Mystery Quest', 'Nabla', 'Nanum Brush Script', 'Nanum Gothic', 'Nanum Gothic Coding', 'Nanum Myeongjo', 'Nanum Pen Script', 'Narnoor', 'Neonderthal', 'Neonderthalface',
  'Nerko One', 'Neuton', 'New Tegomin', 'News Cycle', 'Newsreader', 'Niconne', 'Nixie One', 'Nobile', 'Nokora', 'Norican',
  'Nosifer', 'Notable', 'Noto Color Emoji', 'Noto Emoji', 'Noto Kufi Arabic', 'Noto Music', 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 'Noto Rashi Hebrew', 'Noto Sans',
  'Noto Sans Adlam', 'Noto Sans Anatolian Hieroglyphs', 'Noto Sans Arabic', 'Noto Sans Armenian', 'Noto Sans Avestan', 'Noto Sans Balinese', 'Noto Sans Bamum', 'Noto Sans Bassa Vah', 'Noto Sans Batak', 'Noto Sans Bengali',
  'Noto Sans Brahmi', 'Noto Sans Buginese', 'Noto Sans Buhid', 'Noto Sans Canadian Aboriginal', 'Noto Sans Carian', 'Noto Sans Caucasian Albanian', 'Noto Sans Chakma', 'Noto Sans Cham', 'Noto Sans Cherokee', 'Noto Sans CJK',
  'Noto Sans Coptic', 'Noto Sans Cuneiform', 'Noto Sans Cypriot', 'Noto Sans Deseret', 'Noto Sans Devanagari', 'Noto Sans Display', 'Noto Sans Duployan', 'Noto Sans Egyptian Hieroglyphs', 'Noto Sans Elbasan', 'Noto Sans Elymaic',
  'Noto Sans Ethiopic', 'Noto Sans Georgian', 'Noto Sans Glagolitic', 'Noto Sans Gothic', 'Noto Sans Grantha', 'Noto Sans Gujarati', 'Noto Sans Gunjala Gondi', 'Noto Sans Gurmukhi', 'Noto Sans HK', 'Noto Sans Hanifi Rohingya',
  'Noto Sans Hanunoo', 'Noto Sans Hatran', 'Noto Sans Hebrew', 'Noto Sans Imperial Aramaic', 'Noto Sans Indic Siyaq Numbers', 'Noto Sans Inscriptional Pahlavi', 'Noto Sans Inscriptional Parthian', 'Noto Sans JP', 'Noto Sans Javanese', 'Noto Sans Kaithi',
  'Noto Sans Kannada', 'Noto Sans Kayah Li', 'Noto Sans Kharoshthi', 'Noto Sans Khmer', 'Noto Sans Khojki', 'Noto Sans Khudawadi', 'Noto Sans KR', 'Noto Sans Lepcha', 'Noto Sans Limbu', 'Noto Sans Linear A',
  'Noto Sans Linear B', 'Noto Sans Lisu', 'Noto Sans Lycian', 'Noto Sans Lydian', 'Noto Sans Mahajani', 'Noto Sans Malayalam', 'Noto Sans Mandaic', 'Noto Sans Manichaean', 'Noto Sans Marchen', 'Noto Sans Masaram Gondi',
  'Noto Sans Medefaidrin', 'Noto Sans Meetei Mayek', 'Noto Sans Mende Kikakui', 'Noto Sans Meroitic', 'Noto Sans Miao', 'Noto Sans Modi', 'Noto Sans Mongolian', 'Noto Sans Mro', 'Noto Sans Multani', 'Noto Sans Myanmar',
  'Noto Sans N Ko', 'Noto Sans Nabataean', 'Noto Sans Newa', 'Noto Sans New Tai Lue', 'Noto Sans Ogham', 'Noto Sans Ol Chiki', 'Noto Sans Old Hungarian', 'Noto Sans Old Italic', 'Noto Sans Old North Arabian', 'Noto Sans Old Permic',
  'Noto Sans Old Persian', 'Noto Sans Old South Arabian', 'Noto Sans Old Turkic', 'Noto Sans Oriya', 'Noto Sans Osage', 'Noto Sans Osmanya', 'Noto Sans Pahawh Hmong', 'Noto Sans Palmyrene', 'Noto Sans Pau Cin Hau', 'Noto Sans Phags Pa',
  'Noto Sans Phoenician', 'Noto Sans Psalter Pahlavi', 'Noto Sans Rejang', 'Noto Sans Runic', 'Noto Sans Samaritan', 'Noto Sans Saurashtra', 'Noto Sans Sharada', 'Noto Sans Shavian', 'Noto Sans Siddham', 'Noto Sans Sign Writing',
  'Noto Sans Sinhala', 'Noto Sans Sogdian', 'Noto Sans Sora Sompeng', 'Noto Sans Soyombo', 'Noto Sans Sundanese', 'Noto Sans Syloti Nagri', 'Noto Sans Syriac', 'Noto Sans TC', 'Noto Sans Tagalog', 'Noto Sans Tagbanwa',
  'Noto Sans Tai Le', 'Noto Sans Tai Tham', 'Noto Sans Tai Viet', 'Noto Sans Takri', 'Noto Sans Tamil', 'Noto Sans Tamil Supplement', 'Noto Sans Telugu', 'Noto Sans Thaana', 'Noto Sans Thai', 'Noto Sans Tibetan',
  'Noto Sans Tifinagh', 'Noto Sans Tirhuta', 'Noto Sans Ugaritic', 'Noto Sans Vai', 'Noto Sans Wancho', 'Noto Sans Warang Citi', 'Noto Sans Yi', 'Noto Sans Zanabazar Square', 'Noto Serif', 'Noto Serif Ahom',
  'Noto Serif Armenian', 'Noto Serif Balinese', 'Noto Serif Bengali', 'Noto Serif Devanagari', 'Noto Serif Display', 'Noto Serif Ethiopic', 'Noto Serif Georgian', 'Noto Serif Grantha', 'Noto Serif Gujarati', 'Noto Serif Gurmukhi',
  'Noto Serif HK', 'Noto Serif Hebrew', 'Noto Serif JP', 'Noto Serif KR', 'Noto Serif Kannada', 'Noto Serif Khmer', 'Noto Serif Khojki', 'Noto Serif Lao', 'Noto Serif Malayalam', 'Noto Serif Myanmar',
  'Noto Serif Oriya', 'Noto Serif SC', 'Noto Serif Sinhala', 'Noto Serif TC', 'Noto Serif Tamil', 'Noto Serif Telugu', 'Noto Serif Thai', 'Noto Serif Tibetan', 'Noto Serif Toto', 'Noto Serif Vithkuqi',
  'Noto Traditional Nushu', 'Noto Znamenny Musical Notation', 'NTR', 'Numans', 'Nunito', 'Nunito Sans', 'Nuosu', 'Ojuju', 'Ole', 'Ole Script',
  'Oooh Baby', 'Open Sans', 'Optician Sans', 'Oregano', 'Orelega One', 'Orienta', 'Original Surfer', 'Oswald', 'Outfit', 'Over the Rainbow',
  'Overlock', 'Overlock SC', 'Overpass', 'Overpass Mono', 'Ovo', 'Oxanium', 'Oxygen', 'Oxygen Mono', 'PT Mono', 'PT Sans',
  'PT Sans Caption', 'PT Sans Narrow', 'PT Serif', 'PT Serif Caption', 'Pacifico', 'Padauk', 'Palanquin', 'Palanquin Dark', 'Pangolin', 'Paprika',
  'Parisienne', 'Passero One', 'Passion One', 'Passions Conflict', 'Pathway Gothic One', 'Patrick Hand', 'Patrick Hand SC', 'Pattaya', 'Patua One', 'Pavanam',
  'Paytone One', 'Peddana', 'Peralta', 'Permanent Marker', 'Petit Formal Script', 'Petit Fleur', 'Petrona', 'Philosopher', 'Phudu', 'Piazzolla',
  'Piedra', 'Pinyon Script', 'Pirata One', 'Pixelify Sans', 'Plaster', 'Play', 'Playball', 'Playfair Display', 'Playfair Display SC', 'Playfair',
  'Plus Jakarta Sans', 'Podkova', 'Poiret One', 'Poller One', 'Pollock', 'Polt', 'Pompiere', 'Pontano Sans', 'Poor Story', 'Poppins',
  'Poppins', 'Port Lligat Sans', 'Port Lligat Slab', 'Potta One', 'Pragati Narrow', 'Pragati One', 'Praise', 'Prata', 'Preahvihear', 'Press Start 2P',
  'Pridi', 'Princess Sofia', 'Prociono', 'Prompt', 'Prosto One', 'Proza Libre', 'Public Sans', 'Puppies', 'Puritan', 'Purple Purse',
  'Qahiri', 'Quando', 'Quantico', 'Quanternary', 'Quattrocento', 'Quattrocento Sans', 'Questrial', 'Quicksand', 'Quintessential', 'Qwigley',
  'Qwitcher Grypen', 'Qwigley', 'Racing Sans One', 'Radio Canada', 'Radley', 'Rajdhani', 'Rakkas', 'Raleway', 'Raleway Dots', 'Ramabhadra',
  'Ramaraja', 'Rambla', 'Rammetto One', 'Rampart One', 'Ranchers', 'Rancho', 'Ranga', 'Rasa', 'Rationale', 'Ravi Prakash',
  'Readex Pro', 'Recursive', 'Red Hat Display', 'Red Hat Mono', 'Red Hat Text', 'Red Rose', 'Redacted', 'Redacted Script', 'Redressed', 'Reem Kufi',
  'Reenie Beanie', 'Reggae One', 'Revalia', 'Rhodium Libre', 'Ribeye', 'Ribeye Marrow', 'Righteous', 'Risque', 'Road Rage', 'Roboto',
  'Roboto Condensed', 'Roboto Flex', 'Roboto Mono', 'Roboto Serif', 'Roboto Slab', 'Rochester', 'Rock 3D', 'Rock Salt', 'RocknRoll One', 'Rokkitt',
  'Romanesco', 'Ropa Sans', 'Rosario', 'Rosarivo', 'Rouge Script', 'Rowdies', 'Rozha One', 'Rubik', 'Rubik Glitch', 'Rubik Iso',
  'Rubik Microbe', 'Rubik Mono One', 'Rubik Moonrocks', 'Rubik Puddles', 'Rubik Spray Paint', 'Rubik Wet Paint', 'Ruda', 'Rufina', 'Ruge Boogie', 'Ruluko',
  'Rum Raisin', 'Ruslan Display', 'Russo One', 'Ruthie', 'Ruwudu', 'Rye', 'STIX Two Math', 'STIX Two Text', 'Saira', 'Saira Condensed',
  'Saira Expanded', 'Saira Semi Condensed', 'Saira Semi Expanded', 'Saira Extra Condensed', 'Saira Stencil One', 'Salsa', 'Sancreek', 'Sanchez', 'Sancreek', 'Sangbleu',
  'Sarabun', 'Sarala', 'Sarina', 'Sarpanch', 'Sassy Frass', 'Satisfy', 'Sawarabi Gothic', 'Sawarabi Mincho', 'Scada', 'Scheherazade',
  'Schibsted Grotesk', 'Scope One', 'Seaweed Script', 'Secular One', 'Sedgwick Ave', 'Sedgwick Ave Display', 'Sevillana', 'Seymour One', 'Sfirs', 'Shadows Into Light',
  'Shadows Into Light Two', 'Shalimar', 'Shantell Sans', 'Shanti', 'Share', 'Share Tech', 'Share Tech Mono', 'Shippori Antique', 'Shippori Antique B1', 'Shippori Mincho',
  'Shippori Mincho B1', 'Shizuru', 'Shojumaru', 'Short Stack', 'Shrikhand', 'Shure Tech Mono', 'Siemreap', 'Sigmar', 'Signika', 'Signika Negative',
  'Signika SC', 'Silkscreen', 'Simonetta', 'Simple', 'Sintony', 'Sirin', 'Sirin Stencil', 'Sixtyfour', 'Sixtyfour', 'Skranji',
  'Slabo 13px', 'Slabo 27px', 'Slackey', 'Smokum', 'Smooch', 'Smooch Sans', 'Smythe', 'Sniglet', 'Snippet', 'Snowburst One',
  'Sofadi One', 'Sofia', 'Sofia Sans', 'Sofia Sans Condensed', 'Sofia Sans Extra Condensed', 'Sofia Sans Semi Condensed', 'Sofia Sans Semi Expanded', 'Solitreo', 'Solway', 'Sometype Mono',
  'Song Myung', 'Sono', 'Sonsie One', 'Sora', 'Sorts Mill Goudy', 'Sour Gummy', 'Source Code Pro', 'Source Sans 3', 'Source Serif 4', 'Space Grotesk',
  'Space Mono', 'Special Elite', 'Special Elite', 'Spectral', 'Spectral SC', 'Spicy Rice', 'Spinnaker', 'Spirax', 'Splash', 'Spline Sans',
  'Spline Sans Mono', 'Squada One', 'Square Peg', 'Sree Krushnadevaraya', 'Sriracha', 'Srisakdi', 'Staatliches', 'Stalemate', 'Stalin One', 'Stalinist One',
  'Stardos Stencil', 'Stint Ultra Condensed', 'Stint Ultra Expanded', 'Stoke', 'Strait', 'Stratos', 'Strawford', 'Streelight', 'Strong', 'Style Script',
  'Sue Ellen Francisco', 'Suez One', 'Sulphur Point', 'Sumana', 'Sunflower', 'Sunshiney', 'Supermercado One', 'Sura', 'Suranna', 'Suravaram',
  'Suwannaphum', 'Swanky and Moo Moo', 'Syncopate', 'Syne', 'Syne Mono', 'Syne Tactile', 'Syne Variable', 'Tinos', 'Tajawal', 'Tangerine',
  'Tapestry', 'Taprom', 'Tauri', 'Taviraj', 'Teko', 'Tektur', 'Telugu', 'Tenali Ramakrishna', 'Tenor Sans', 'Text Me One',
  'Texturina', 'Thasadith', 'The Girl Next Door', 'The Nautigal', 'Tienne', 'Tillana', 'Tilt Neon', 'Tilt Prism', 'Tilt Warp', 'Timmana',
  'Tinos', 'Titan One', 'Titillium Web', 'Tomorrow', 'Tourney', 'Trade Winds', 'Train One', 'Trebuchet MS', 'Triangleosceles', 'Trirong',
  'Trispace', 'Trocchi', 'Trochut', 'Truculenta', 'Trykker', 'Tsunagi', 'Tulpen One', 'Turret Road', 'Twinkle Star', 'Twitter Chroma',
  'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Mono', 'Uchen', 'Ultra', 'Unbounded', 'Uncial Antiqua', 'Underdog', 'UnifrakturCook', 'UnifrakturMaguntia',
  'Unkempt', 'Unlock', 'Unna', 'Unna', 'Updock', 'Urbanist', 'Uroob', 'Vampiro One', 'Varela', 'Varela Round',
  'Varta', 'Vast Shadow', 'Vazirmatn', 'Vecna', 'Vesper Libre', 'Vibes', 'Vibur', 'Victor Mono', 'Vidaloka', 'Viga',
  'Vina Sans', 'Voces', 'Voces', 'Vollkorn', 'Vollkorn SC', 'Voltaire', 'Vt323', 'Walter Turncoat', 'Walter', 'Wanted Sans',
  'Warnes', 'Water Brush', 'Waterfall', 'Wellfleet', 'Wendy One', 'Wendy', 'Wix Madefor Display', 'Wix Madefor Text', 'Wire One', 'Work Sans',
  'Workbench', 'Wunderland', 'Xanh Mono', 'Xolonium', 'Yaldevi', 'Yanone Kaffeesatz', 'Yantramanav', 'Yatra One', 'Yellowtail', 'Yeon Sung',
  'Yeseva One', 'Yesteryear', 'Yomogi', 'Yona', 'Yrsa', 'Yusei Magic', 'ZCOOL KuaiLe', 'ZCOOL QingKe HuangYou', 'ZCOOL XiaoWei', 'Zen Antique',
  'Zen Antique Soft', 'Zen Dots', 'Zen Kaku Gothic Antique', 'Zen Kaku Gothic New', 'Zen Kurenaido', 'Zen Loop', 'Zen Maru Gothic', 'Zen Old Mincho', 'Zen Tokyo Zoo', 'Zeyada',
  'Zhi Mang Xing', 'Zilla Slab', 'Zilla Slab Highlight',
]

export default function AdminFonts() {
  const { settings, updateSettings } = useSettings()
  const [search, setSearch] = useState('')
  const [fontProducts, setFontProducts] = useState(settings?.font_products || 'DM Sans')
  const [fontCategories, setFontCategories] = useState(settings?.font_categories || 'DM Sans')
  const [fontBanners, setFontBanners] = useState(settings?.font_banners || 'DM Sans')
  const [fontGlobal, setFontGlobal] = useState(settings?.font_global || '')
  const [useGlobal, setUseGlobal] = useState(!!settings?.font_global)
  const [saveMsg, setSaveMsg] = useState('')
  const loadedFontsRef = useRef(new Set())

  // Load font on demand for preview
  const loadFont = (fontName) => {
    if (loadedFontsRef.current.has(fontName)) return
    loadedFontsRef.current.add(fontName)
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s/g, '+')}:wght@400;500;700;900&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  const filteredFonts = FONT_LIST.filter(f =>
    f.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    await updateSettings({
      font_products: fontProducts,
      font_categories: fontCategories,
      font_banners: fontBanners,
      font_global: useGlobal ? fontGlobal : null,
    })
    setSaveMsg('Fontes guardadas com sucesso!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const FontPreview = ({ font, selected, onClick }) => {
    loadFont(font)
    return (
      <button
        onClick={onClick}
        className={`p-3 rounded-xl border text-left transition-colors ${
          selected ? 'border-brand-pink bg-brand-pink/10' : 'border-white/10 hover:border-white/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/40">{font}</span>
          {selected && <Check size={14} className="text-brand-pink" />}
        </div>
        <p style={{ fontFamily: `"${font}", sans-serif` }} className="text-lg font-bold truncate">
          Infinity Progress
        </p>
      </button>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black uppercase mb-8">Fontes de Letra</h1>

      {/* Global font option */}
      <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={useGlobal}
            onChange={e => setUseGlobal(e.target.checked)}
            className="w-5 h-5 accent-brand-pink"
          />
          <h2 className="text-lg font-bold">Usar a mesma fonte para todo o site</h2>
        </div>
        {useGlobal && (
          <div>
            <p className="text-sm text-white/50 mb-3">Selecione a fonte para todo o site:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto admin-scroll">
              {filteredFonts.slice(0, 100).map(font => (
                <FontPreview key={font} font={font} selected={fontGlobal === font} onClick={() => setFontGlobal(font)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Individual fonts */}
      {!useGlobal && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar fonte..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:border-brand-pink focus:outline-none"
            />
          </div>

          {/* Products font */}
          <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold mb-4">Fonte dos Produtos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto admin-scroll">
              {filteredFonts.slice(0, 80).map(font => (
                <FontPreview key={font} font={font} selected={fontProducts === font} onClick={() => setFontProducts(font)} />
              ))}
            </div>
          </div>

          {/* Categories font */}
          <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold mb-4">Fonte das Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto admin-scroll">
              {filteredFonts.slice(0, 80).map(font => (
                <FontPreview key={font} font={font} selected={fontCategories === font} onClick={() => setFontCategories(font)} />
              ))}
            </div>
          </div>

          {/* Banners font */}
          <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold mb-4">Fonte dos Banners</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto admin-scroll">
              {filteredFonts.slice(0, 80).map(font => (
                <FontPreview key={font} font={font} selected={fontBanners === font} onClick={() => setFontBanners(font)} />
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full bg-brand-pink hover:bg-brand-pinkDark text-white py-3 rounded-full font-bold uppercase text-sm transition-colors mt-6"
      >
        Guardar Fontes
      </button>
      {saveMsg && <p className="text-green-400 text-sm text-center mt-4">{saveMsg}</p>}
    </div>
  )
}
