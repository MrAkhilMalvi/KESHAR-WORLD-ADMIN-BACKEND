const pgClient = require('../../config/db');

async function get_products(req, res, next) {

    try {
        
        const result = await pgClient.query('SELECT * FROM admin_products_get_all()',[]);

        return res.send({ success: true, data: result.rows })
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
            thumbnail_url,
            language
        } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_products_insert($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[title, slug, description, category, sub_category, price, discount_price, is_free,thumbnail_url,language]);

        return res.send({ success: true, data: result.rows })
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
        const result = await pgClient.query('SELECT * FROM admin_products_update($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id,title, slug, description, category, sub_category, price, discount_price, is_free,thumbnail_url,language]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}


async function delete_products(req, res, next) {

    try {
        const { id } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_products_delete($1)',[id]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}



module.exports = {
    add_products : add_products,
    update_products : update_products,
    delete_products : delete_products,
    get_products : get_products
}