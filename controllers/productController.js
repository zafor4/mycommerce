const _=require('lodash')
const formidable=require('formidable')
const fs=require('fs')
const {Product,validate}=require('../models/product')




module.exports.createProduct = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(400).send("Something went wrong!");
        }


        // Handle file array if multiple files are present
        const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

        if (!photoFile) {
            return res.status(400).send("No image provided!");
        }

        // Convert fields to appropriate types
        const productFields = {
            name: String(fields.name),
            description: String(fields.description),
            price: parseFloat(fields.price),
            category: String(fields.category),
            quantity: parseInt(fields.quantity, 10)
        };

        const { error } = validate(_.pick(productFields, ["name", "description", "price", "category", "quantity"]));
        if (error) return res.status(400).send(error.details[0].message);

        const product = new Product(productFields);

        try {
            const data = await fs.promises.readFile(photoFile.filepath || photoFile.path);
            product.photo.data = data;
            product.photo.contentType = photoFile.mimetype;

            try {
                const result = await product.save();
                return res.status(201).send({
                    message: "Product Created Successfully!",
                    data: _.pick(result, ["name", "description", "price", "category", "quantity"]),
                });
            } catch (error) {
                console.error('Error saving product:', error);
                return res.status(500).send("Internal Server Error!");
            }
        } catch (error) {
            console.error('Error reading file:', error);
            return res.status(500).send("Internal Server Error!");
        }
    });
};

// Query Parameter
// api/product?order=desc&sortBy=name&limit=10
module.exports.getProducts = async (req, res) => {
    let order = req.query.order === 'desc' ? -1 : 1;
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const products = await Product.find()
        .select({ photo: 0 })
        .sort({ [sortBy]: order })
        .limit(limit)
        .populate('category', 'name');
    return res.status(200).send(products);

}

module.exports.getProductById=async (req,res)=>{
    const productId=req.params.id;
    const product=await Product.findById(productId)
    .select({photo:0})
    .populate('category','name')
    if (!product) res.status(404).send("Not Found")
        return res.status(200).send(product)

}

module.exports.getPhoto=async (req,res)=>{
    const productId=req.params.id
    const product=await Product.findById(productId)
    console.log(product.photo.data)
    res.set('Content-Type',product.photo.contentType)
    return res.status(200).send(product.photo.data)
}





module.exports.updateProductById = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found!");
        }

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(400).send("Something went wrong!");
            }


            // Convert fields to appropriate types
            const updatedFields = _.mapValues(_.pick(fields, ["name", "description", "price", "category", "quantity"]), value => 
                Array.isArray(value) ? value[0] : value
            );
            console.log("ami korchi",updatedFields)

            _.assignIn(product, updatedFields);


            const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
            if (photoFile) {
                try {
                    const data = await fs.promises.readFile(photoFile.filepath || photoFile.path);
                    product.photo.data = data;
                    product.photo.contentType = photoFile.mimetype;
                } catch (error) {
                    console.error('Error reading file:', error);
                    return res.status(500).send("Internal Server Error!");
                }
            }

            try {
                const result = await product.save();
                return res.status(200).send({
                    message: "Product updated successfully!",
                    data: _.pick(result, ["name", "description", "price", "category", "quantity"]),
                });
            } catch (error) {
                console.error('Error saving product:', error);
                return res.status(500).send("Internal Server Error!");
            }
        });
    } catch (error) {
        console.error('Error finding product:', error);
        return res.status(500).send("Internal Server Error!");
    }
};


module.exports.filterProducts=async (req,res)=>{
    let order=req.body.order==='desc'?-1:1;
    let sortBy=req.body.sortBy?req.body.sortBy:'_id'
    let limit=req.body.limit?parseInt(req.body.limit):10;
    let skip=parseInt(req.body.skip)
    let filters=req.body.filters;

    let args={}

    for (let key in filters){
        if (filters[key].length>0){
            if (key==='price'){
                args['price']={
                    $gte:filters['price'][0],
                    $lte:filters['price'][1]
                }
            }

            if (key==='category'){
                args['category']={
                    $in:filters['category']
                }

            }
        }
    }


    const product=await Product.find(args)
    .select({photo:0})
    .populate('category','name')
    .sort({[sortBy]:order})
    .skip(skip)
    .limit(limit)

    return res.status(200).send(product);

}
