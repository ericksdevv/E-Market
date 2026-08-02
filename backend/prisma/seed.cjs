const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const image = {
  camponesa:'https://camponesa.com.br/wp-content/uploads/2026/05/LeiteEmPoIntegral200g-EAN7896259410133.webp',
  friboi:'https://zonasul.vtexassets.com/arquivos/ids/3086428-800-auto?aspect=true&height=auto&v=638036991573300000&width=800',
  sadia:'https://coopsp.vtexassets.com/arquivos/ids/231126-150-auto?aspect=true&height=auto&v=638090452785600000&width=150',
  food:'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=82',
  fruits:'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=82',
  bread:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=82',
  drink:'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=82',
  clean:'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=82',
};
const categories=[['Hortifruti','hortifruti'],['Açougue','acougue'],['Padaria','padaria'],['Bebidas','bebidas'],['Laticínios','laticinios'],['Limpeza','limpeza'],['Higiene','higiene'],['Congelados','congelados'],['Mercearia','mercearia'],['Pet Shop','pet-shop'],['Bazar','bazar']];
const products=[
 ['Leite em Pó Integral Camponesa 200g','leite-em-po-camponesa-200g','Laticínios','Camponesa','200 g',8.18,9.49,80,image.camponesa],
 ['Picanha Bovina Friboi Peça','picanha-friboi-peca','Açougue','Friboi','aprox. 1 kg',79.90,92.90,25,image.friboi],
 ['Peito de Frango Sadia','peito-de-frango-sadia','Açougue','Sadia','1 kg',18.99,22.90,45,image.sadia],
 ['Linguiça Toscana Sadia','linguica-toscana-sadia','Açougue','Sadia','700 g',17.49,19.90,40,image.sadia],
 ['Contra Filé Friboi','contra-file-friboi','Açougue','Friboi','1 kg',48.90,55.90,30,image.friboi],
 ['Banana Nanica','banana-nanica','Hortifruti',null,'1 kg',6.90,8.50,100,image.fruits],
 ['Maçã Gala','maca-gala','Hortifruti',null,'1 kg',12.90,null,85,image.fruits],
 ['Pão Francês','pao-frances','Padaria',null,'1 kg',14.99,null,70,image.bread],
 ['Pão de Forma Pullman','pao-de-forma-pullman','Padaria','Pullman','480 g',10.49,12.29,45,image.bread],
 ['Coca-Cola Original','coca-cola-original-2l','Bebidas','Coca-Cola','2 L',11.99,13.90,90,image.drink],
 ['Guaraná Antarctica','guarana-antarctica-2l','Bebidas','Antarctica','2 L',8.99,10.49,70,image.drink],
 ['Detergente Neutro Ypê','detergente-ype-neutro','Limpeza','Ypê','500 ml',2.99,3.79,120,image.clean],
 ['Arroz Tipo 1 Tio João','arroz-tio-joao-5kg','Mercearia','Tio João','5 kg',25.90,29.90,55,image.food],
 ['Pizza de Calabresa Sadia','pizza-calabresa-sadia','Congelados','Sadia','460 g',18.90,21.90,35,image.sadia],
];
async function main(){
 const map={}; for(const [name,slug] of categories){map[name]=await prisma.category.upsert({where:{slug},update:{name,isActive:true},create:{name,slug}})}
 for(const [name,slug,category,brand,unit,price,promotionalPrice,stock,url] of products){const p=await prisma.product.upsert({where:{slug},update:{name,brand,unit,price,promotionalPrice,stock,isActive:true,categoryId:map[category].id},create:{name,slug,brand,unit,price,promotionalPrice,stock,categoryId:map[category].id}});await prisma.productImage.deleteMany({where:{productId:p.id}});await prisma.productImage.create({data:{productId:p.id,url,sortOrder:0}})}
 console.log(`Catálogo pronto: ${products.length} produtos.`);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
