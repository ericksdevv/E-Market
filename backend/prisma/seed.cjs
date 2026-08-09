const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const categories=[['Hortifruti','hortifruti'],['Açougue','acougue'],['Padaria','padaria'],['Bebidas','bebidas'],['Laticínios','laticinios'],['Limpeza','limpeza'],['Higiene','higiene'],['Congelados','congelados'],['Mercearia','mercearia'],['Pet Shop','pet-shop'],['Bazar','bazar']];
const products=[
 ['Leite em Pó Integral Camponesa 200g','leite-em-po-camponesa-200g','Laticínios','Camponesa','200 g',8.18,9.49,80],
 ['Picanha Bovina Friboi Peça','picanha-friboi-peca','Açougue','Friboi','aprox. 1 kg',79.90,92.90,25],
 ['Peito de Frango Sadia','peito-de-frango-sadia','Açougue','Sadia','1 kg',18.99,22.90,45],
 ['Linguiça Toscana Sadia','linguica-toscana-sadia','Açougue','Sadia','700 g',17.49,19.90,40],
 ['Contra Filé Friboi','contra-file-friboi','Açougue','Friboi','1 kg',48.90,55.90,30],
 ['Banana Nanica','banana-nanica','Hortifruti',null,'1 kg',6.90,8.50,100],
 ['Maçã Gala','maca-gala','Hortifruti',null,'1 kg',12.90,null,85],
 ['Pão Francês','pao-frances','Padaria',null,'1 kg',14.99,null,70],
 ['Pão de Forma Pullman','pao-de-forma-pullman','Padaria','Pullman','480 g',10.49,12.29,45],
 ['Coca-Cola Original','coca-cola-original-2l','Bebidas','Coca-Cola','2 L',11.99,13.90,90],
 ['Guaraná Antarctica','guarana-antarctica-2l','Bebidas','Antarctica','2 L',8.99,10.49,70],
 ['Detergente Neutro Ypê','detergente-ype-neutro','Limpeza','Ypê','500 ml',2.99,3.79,120],
 ['Creme Dental Colgate Total 12','creme-dental-colgate-total-12','Higiene','Colgate','90 g',7.99,9.49,65],
 ['Arroz Tipo 1 Tio João','arroz-tio-joao-5kg','Mercearia','Tio João','5 kg',25.90,29.90,55],
 ['Pizza de Calabresa Sadia','pizza-calabresa-sadia','Congelados','Sadia','460 g',18.90,21.90,35],
 ['Ração Pedigree Carne para Cães Adultos','racao-pedigree-carne-caes-adultos','Pet Shop','Pedigree','1 kg',24.90,27.90,38],
 ['Papel Alumínio Wyda','papel-aluminio-wyda-30cm','Bazar','Wyda','30 cm × 7,5 m',6.49,7.49,48],
];
async function main(){
 const map={}; for(const [name,slug] of categories){map[name]=await prisma.category.upsert({where:{slug},update:{name,isActive:true},create:{name,slug}})}
 for(const [name,slug,category,brand,unit,salePrice,regularPrice,stock] of products){const price=regularPrice??salePrice;const promotionalPrice=regularPrice?salePrice:null;const p=await prisma.product.upsert({where:{slug},update:{name,brand,unit,price,promotionalPrice,stock,isActive:true,categoryId:map[category].id},create:{name,slug,brand,unit,price,promotionalPrice,stock,categoryId:map[category].id}});await prisma.productImage.deleteMany({where:{productId:p.id}})}
 console.log(`Catálogo pronto: ${products.length} produtos.`);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
