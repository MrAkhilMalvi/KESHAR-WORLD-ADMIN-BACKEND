const pgClient = require('../../config/db');
const config = require ('config')
const { DynamicSignedURL , Dynamic_Delete_R2_Data , deleteCourseAndModules } = require('../controllers/courses')

const cloude = config.get("App.cloude");

async function get_products(req, res, next) {

    try {
           const{ limit , offset} = req.body ;
        const result = await pgClient.query('SELECT * FROM admin_products_get_all($1,$2)',[limit,offset]);

        const finalData = result.rows.map(product => {
            return {
                ...product,
                thumbnail_url: product.thumbnail_url 
                    ? `${cloude.PUBLIC_BUCKET_KEY}/${product.thumbnail_url}` 
                    : null
            };
        });

        return res.send({ success: true, result: finalData })
    } catch (error) {
        next(error);
    }
}

async function add_products(req, res, next) {

    try {
        const {
            title,
            slug,
            description,
            category,
            sub_category,
            price,
            discount_price,
            is_free,
            qty ,
            language,
            contentType,
            fileName
        } = req.body;
     
        const type = "product_thumbnail";

        const result = await pgClient.query('SELECT * FROM admin_products_insert($1,$2,$3,$4,$5,$6,$7,$8,$9,$10 )',[title, slug, description, category, sub_category, price, discount_price, is_free,qty ,language]);
 
        const id = result.rows[0].admin_products_insert ;
  
        const data = await DynamicSignedURL(type, id,fileName, contentType);
      
        const results = await pgClient.query('SELECT * FROM admin_products_insert_course_url($1,$2)',[id,data.objectKey]);

        return res.send({ success: true, data: id ,objectKey : data.uploadUrl  })
    } catch (error) {
        next(error);
    }
}

async function update_products(req, res, next) {

    try {
        const {
            id,
            title,
            slug,
            description,
            category,
            sub_category,
            price,
            discount_price,
            is_free,
            thumbnail_url,
            language
        } = req.body;

        const data = await pgClient.query('SELECT * FROM admin_products_select_id($1)',[id]);
      console.log("data",data.rows)
        const  R2_Data = await Dynamic_Delete_R2_Data( data.rows[0].thumbnail_url);

        const result = await pgClient.query('SELECT * FROM admin_products_update($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id,title, slug, description, category, sub_category, price, discount_price, is_free,thumbnail_url,language]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function delete_products(req, res, next) {

    try {
        const { id } = req.body;
        const types = 'products';
        console.log("id",id)
        const result = await pgClient.query('SELECT * FROM admin_products_select_id($1)',[id]);
      console.log(result.rows[0].thumbnail_url)
        const  R2_Data = await Dynamic_Delete_R2_Data( result.rows[0].thumbnail_url);
     
       await deleteCourseAndModules(types,[id])

        const  data= await pgClient.query('SELECT * FROM admin_products_delete($1)',[id]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function delete_products_thumbnail(req, res, next) {

    try {
        const { id } = req.body;

        const result = await pgClient.query('SELECT * FROM admin_products_select_id($1)',[id]);
      
        const  data = await Dynamic_Delete_R2_Data( result.rows[0].thumbnail_url)
       
     
        return res.send({ success: true, data:data  })
    } catch (error) {
        next(error);
    }
}

async function saveProductImage(req, res) {
    try {
      const { product_id, objectKey ,positions} = req.body;
  
      const result = await pgClient.query(
        "SELECT admin_products_add_image($1, $2 , $3)",
        [product_id, objectKey , positions]
      );
  
      return res.json({
        success: true,
        image_url: result.rows[0]
      });
  
    } catch (err) {
      console.error("Save Product Image Error:", err);
      res.status(500).json({success : false , message: "Failed to save image" });
    }
  }
  
  async function deleteProductImage(req, res) {
    try {
      const { id } = req.body;

      const result = await pgClient.query("SELECT admin_products_select_images($1)",[ id ]);

      await Dynamic_Delete_R2_Data(result.rows[0].image_url)
  
      return res.json({
        success : true,
        message : "the images are delete"
      });
  
    } catch (err) {
      console.error("Save Product Image Error:", err);
      res.status(500).json({success : false , message: "Failed to save image" });
    }
  }

module.exports = {
    add_products : add_products,
    update_products : update_products,
    delete_products : delete_products,
    get_products : get_products,
    saveProductImage : saveProductImage,
    delete_products_thumbnail : delete_products_thumbnail,
    deleteProductImage : deleteProductImage
}