export type Product = { id:number; name:string; slug:string; category:string; price:number; oldPrice?:number; unit:string; emoji:string; tag?:string; bg:string; image?:string; brand?:string };
export const categories = [
  {name:'Hortifruti',slug:'hortifruti',emoji:'🥬'}, {name:'Açougue',slug:'acougue',emoji:'🥩'}, {name:'Padaria',slug:'padaria',emoji:'🥖'}, {name:'Bebidas',slug:'bebidas',emoji:'🥤'}, {name:'Laticínios',slug:'laticinios',emoji:'🥛'}, {name:'Limpeza',slug:'limpeza',emoji:'🧼'}, {name:'Higiene',slug:'higiene',emoji:'🪥'}, {name:'Congelados',slug:'congelados',emoji:'🧊'}, {name:'Mercearia',slug:'mercearia',emoji:'🫙'}, {name:'Pet Shop',slug:'pet-shop',emoji:'🐾'}, {name:'Bazar',slug:'bazar',emoji:'🧺'}
];
export const featuredProducts:Product[] = [
  {id:1,name:'Leite em Pó Integral Camponesa',slug:'leite-em-po-camponesa-200g',category:'Laticínios',brand:'Camponesa',price:8.18,oldPrice:9.49,unit:'200 g',emoji:'🥛',tag:'Oferta',bg:'#f4f7ff',image:'https://camponesa.com.br/wp-content/uploads/2026/05/LeiteEmPoIntegral200g-EAN7896259410133.webp'},
  {id:2,name:'Picanha Bovina Friboi',slug:'picanha-friboi-peca',category:'Açougue',brand:'Friboi',price:79.9,oldPrice:92.9,unit:'aprox. 1 kg',emoji:'🥩',tag:'Mais vendido',bg:'#fff3f0',image:'https://zonasul.vtexassets.com/arquivos/ids/3086428-800-auto?aspect=true&height=auto&v=638036991573300000&width=800'},
  {id:3,name:'Peito de Frango Sadia',slug:'peito-de-frango-sadia',category:'Açougue',brand:'Sadia',price:18.99,oldPrice:22.9,unit:'1 kg',emoji:'🍗',tag:'Oferta',bg:'#fff9e9',image:'https://coopsp.vtexassets.com/arquivos/ids/231126-150-auto?aspect=true&height=auto&v=638090452785600000&width=150'},
  {id:4,name:'Banana Nanica',slug:'banana-nanica',category:'Hortifruti',price:6.9,oldPrice:8.5,unit:'1 kg',emoji:'🍌',tag:'Fresquinho',bg:'#fff7ce',image:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=82'},
  {id:5,name:'Pão Francês',slug:'pao-frances',category:'Padaria',price:14.99,unit:'1 kg',emoji:'🥖',tag:'Assado hoje',bg:'#fff4df'},
  {id:6,name:'Detergente Neutro',slug:'detergente-neutro',category:'Limpeza',price:2.99,oldPrice:3.79,unit:'500 ml',emoji:'🧴',tag:'Oferta',bg:'#edfaff'},
  {id:7,name:'Arroz Tipo 1',slug:'arroz-tipo-1',category:'Mercearia',price:25.9,unit:'Pacote 5 kg',emoji:'🍚',bg:'#f7f2e8'},
  {id:8,name:'Pizza de Calabresa',slug:'pizza-calabresa',category:'Congelados',price:18.9,unit:'460 g',emoji:'🍕',tag:'Prático',bg:'#fff1e9'}
];
export const money = (value:number) => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
