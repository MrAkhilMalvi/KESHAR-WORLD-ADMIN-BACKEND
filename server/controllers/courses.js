const pgClient = require('../../config/db');
const config = require ('config')


const cloude = config.get("App.cloude");
const { R2uploedFrom, PutObjectCommand, getSignedUrl ,R2DeleteFrom , deleteAllByPrefix} = require("../helpers/r2Client");

//---------------------------- Add Function ------------------------------------
async function add_course(req, res, next) {

    try {
        const {
            title,
            price,
            description,
            is_free,
            instructor,
            original_price,
            badge, 
            category,
            contentType,
            fileName
        } = req.body;
        
        const type = "course_thumbnail";

        const result = await pgClient.query('SELECT * FROM admin_courses_insert_course($1,$2,$3,$4,$5,$6,$7,$8)',[title, price, description, is_free, instructor, original_price, badge, category]);
        
        const id = result.rows[0].admin_courses_insert_course 
  
       const data = await DynamicSignedURL(type, id,fileName, contentType)
   
       const results = await pgClient.query('SELECT * FROM admin_courses_insert_course_url($1,$2)',[id,data.objectKey]);
 

        return res.send({ success: true, data: id, objectKey : data.uploadUrl })
    } catch (error) {
        next(error);
    }
}

async function add_course_modules(req, res, next) {

    try {
        const {
            course_id,
            module_title,
            position
        } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_insert_modules($1,$2,$3)',[course_id, module_title, position]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function add_videos(req, res, next) {

    try {
        const {
            module_id,
            video_title,
            objectKey,
            duration,
            description,
            position,
            thumbnail_url
        } = req.body;


        console.log("body",req.body," ",objectKey);

        const result = await pgClient.query('SELECT * FROM admin_courses_insert_videos($1,$2,$3,$4,$5,$6,$7)',[module_id, video_title, objectKey, duration,description, position,thumbnail_url]);



        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

//---------------------------- Update Function ------------------------------------

async function update_course(req, res, next) {

    try {
        const {
            id,
            title,
            price,
            description,
            is_free,
            instructor,
            original_price,
            badge,
            category,
            thumbnail_url
        } = req.body;
       console.log("bodydata",req.body)

        const data = await pgClient.query('SELECT * FROM admin_courses_select($1)',[id]);
        console.log("data",data.rows)

        // const url =`${cloude.PUBLIC_BUCKET_KEY}/${data.rows[0].thumbnail}`;
        // console.log("url",url)

       if(thumbnail_url !== data.rows[0].thumbnail){
        console.log("R2_Data1")
        const  R2_Data = await Dynamic_Delete_R2_Data( data.rows[0].thumbnail);
       }
       console.log("R2_Data")
        const result = await pgClient.query('SELECT * FROM admin_courses_updation_course($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[id,title, price, description, is_free, instructor, original_price, badge, category,thumbnail_url]);

        return res.send({ success: true, data: result.rows })
    } catch (error) {
        next(error);
    }
}

async function update_course_modules(req, res, next) {

    try {
        const {
            modules_id,
            module_title,
            position
        } = req.body;


        const result = await pgClient.query('SELECT * FROM admin_courses_update_module($1,$2,$3)',[modules_id, module_title, position]);

        return res.send({ success: true, data: result.rows[0] })
    } catch (error) {
        next(error);
    }
}

async function update_videos(req, res, next) {
  try {
    const {
      video_id,
      title,
      url,
      video_duration,
      video_description,
      video_position,
      thumbnail_url,
    } = req.body;

    console.log("req.body", req.body);

    // 1) Get existing video details
    const data = await pgClient.query(
      "SELECT * FROM admin_courses_select_video($1)",
      [video_id]                     // FIXED
    );

    if (data.rows.length === 0) {
      return res.status(404).send({
        success: false,
        message: "Video not found",
      });
    }

    const old_video = data.rows[0];

    // 2) Delete old thumbnail if updated
    if (thumbnail_url && old_video.thumbnail_url && thumbnail_url !== old_video.thumbnail_url) {
      await Dynamic_Delete_R2_Data(old_video.thumbnail_url);
    }

    // 3) Delete old video if updated
    if (url && old_video.video_url && url !== old_video.video_url) {
      await Dynamic_Delete_R2_Data(old_video.video_url);
    }

    // 4) Update record in DB
    const result = await pgClient.query(
      "SELECT * FROM admin_courses_update_videos($1,$2,$3,$4,$5,$6,$7)",
      [
        video_id,
        title,
        url,
        video_duration,
        video_description,
        video_position,
        thumbnail_url,
      ]
    );

    return res.send({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("update_videos ERROR:", error);
    next(error);
  }
}

//---------------------------- select Function ------------------------------------

async function select_all_courses(req, res, next) {

    try {
      
        const result = await pgClient.query('SELECT * FROM admin_courses_select_all()',[]);

        const finalData = result.rows.map(course => {
            return {
                ...course,
                thumbnail_url: course.thumbnail_url 
                    ? `${cloude.PUBLIC_BUCKET_KEY}/${course.thumbnail_url}` 
                    : null
            };
        });

        return res.send({ success: true, data: finalData });
    } catch (error) {
        next(error);
    }
}

async function get_modules_by_course(req, res, next) {

    try {
        const { couses_id } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_get_modules_by_course($1)',[couses_id]);

        return res.send({ success: true, data: result.rows })
    } catch (error) {
        next(error);
    }
}

async function get_videos_by_module(req, res, next) {

    try {
        const { module_id } = req.body;
        const result = await pgClient.query('SELECT * FROM admin_courses_get_videos_by_module($1)',[module_id]);

        return res.send({ success: true, data: result.rows })
    } catch (error) {
        next(error);
    }
}

//---------------------------- Delete Function ------------------------------------

async function delete_Video(req,res,next){
  try {
    const { video_id } = req.body;
    const result = await pgClient.query("SELECT * FROM admin_courses_select_video ($1)", [video_id]);
    
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "Video not found" });

    const video = result.rows[0];

    if (video.video_url && video.video_url != null) await Dynamic_Delete_R2_Data(video.video_url);

    if (video.thumbnail_url  && video.thumbnail_url != null) await Dynamic_Delete_R2_Data(video.thumbnail_url);
   

    const data = await pgClient.query("SELECT * FROM admin_delete_video($1)", [video_id]);
    
     res.json({ success: true, message: "Video deleted" });

  } catch (error) {
    next (error)
  }
}

async function delete_Module(req,res,next){
  try {
    const { module_id } = req.body;
    const types ='module'
    await deleteCourseAndModules (types,[module_id])
    const data = await pgClient.query("SELECT * FROM admin_courses_module_delete($1)", [module_id]);
    
    return res.json({ success: true, message: "Module deleted" });
  } catch (error) {
    next (error)
  }
}

async function delete_Courses(req, res, next) {
  try {
  
    const { couses_id } = req.body;
    const result = await pgClient.query('SELECT * FROM admin_courses_get_modules_by_course($1)',[couses_id]);
    const module_ids = result.rows.map(row => row.module_id);
console.log("module_ids",module_ids)
    await deleteCourseAndModules("courses", module_ids, couses_id);

    // delete database rows
    await pgClient.query("SELECT * FROM admin_delete_course($1)", [couses_id]);

    return res.json({ success: true, message: "Course deleted" });

  } catch (error) {
    next(error);
  }
}

//---------------------------- clode Function ------------------------------------
/*
async function getDynamicSignedURL(req, res) {
    try {
        console.log("req.body",req.body)
      const { type, course_id, module_id, video_id, product_id, fileName, contentType } = req.body;
 
      if (!type || !fileName) {
        return res.status(400).json({ success: false, message: "type and fileName required" });
      }
  
      const safeName = fileName.replace(/\s/g, "_");
      let objectKey = "";
  
      // ----- COURSES -----
      if (type === "course_thumbnail") {
        if (!course_id) return res.status(400).json({ message: "course_id required" });
  
        objectKey = `thumbnails/courses/${course_id}/${Date.now()}_${safeName}`;
      }
  
      // ----- PRODUCTS -----
      else if (type === "product_thumbnail") {
        if (!product_id) return res.status(400).json({ message: "product_id required" });
  
        objectKey = `thumbnails/products/${product_id}/${Date.now()}_${safeName}`;
      }
  
      // ----- VIDEOS -----
      else if (type === "video") {
        if (!module_id || !video_id)
          return res.status(400).json({ message: "module_id & video_id required" });
  
        objectKey = `videos/${module_id}/${video_id}/${Date.now()}_${safeName}`;
      }
  
      // ----- VIDEO THUMBNAILS -----
      else if (type === "video_thumbnail") {
        if (!module_id || !video_id)
          return res.status(400).json({ message: "module_id & video_id required" });
  
        objectKey = `thumbnails/videos/${module_id}/${video_id}/${Date.now()}_${safeName}`;
      }
  
      // Create Signed URL
      const command = new PutObjectCommand({
        Bucket: cloude.R2_BUCKET,
        Key: objectKey,
        ContentType: contentType || "application/octet-stream",
      });
  
      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  
      return res.json({
        success: true,
        uploadUrl,
        objectKey,
      });
  
    } catch (error) {
      console.error("Dynamic Signed URL Error:", error);
      res.status(500).json({ success: false, message: "Failed to create signed URL" });
    }
  }
*/

// single iteam add
async function DynamicSignedURL(type, id,fileName, contentType) {
    try {
      console.log("body",type, id,fileName, contentType)

      if (!type || !fileName) {
        return res.status(400).json({ success: false, message: "type and fileName required" });
      }
  
      // Extract extension
      const ext = fileName.split('.').pop();
      const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/\s/g, "_");
      const safeName = `${baseName}.${ext}`;
      
      // Auto MIME
      const mimeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
      };
      const mimeType = contentType || mimeMap[ext.toLowerCase()] || "application/octet-stream";
  
      let objectKey = "";
  
      if (type === "course_thumbnail") {
        if (!id) return res.status(400).json({ message: "course_id required" });
        objectKey = `thumbnails/courses/${id}/${Date.now()}_${safeName}`;
      }
      else if (type === "product_thumbnail") {
        if (!id) return res.status(400).json({ message: "product_id required" });
        objectKey = `thumbnails/products/${id}/${Date.now()}_${safeName}`;
      }
    
  
      const command = new PutObjectCommand({
        Bucket: cloude.R2_BUCKET,
        Key: objectKey,
        ContentType: mimeType,
      });
  
      const uploadUrl = await getSignedUrl(R2uploedFrom, command, { expiresIn: 3600 });
  
      return {
        success: true,
        uploadUrl,
        objectKey,
      };
  
    } catch (error) {
      console.error("Dynamic Signed URL Error:", error);
      res.status(500).json({ success: false, message: "Failed to create signed URL" });
    }
  }

// single update iteam
  async function getDynamicSignedURL(req,res) {
    try {
    
     const { type, course_id, module_id, video_id, product_id, fileName, contentType } = req.body;

      if (!type || !fileName) {
        return res.status(400).json({ success: false, message: "type and fileName required" });
      }
  
      // Extract extension
      const ext = fileName.split('.').pop();
      const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/\s/g, "_");
      const safeName = `${baseName}.${ext}`;
      
      // Auto MIME
      const mimeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
        mp4: "video/mp4",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
      };
      const mimeType = contentType || mimeMap[ext.toLowerCase()] || "application/octet-stream";
  
      let objectKey = "";
  
      if (type === "course_thumbnail") {
        if (!course_id) return res.status(400).json({ message: "course_id required" });
        objectKey = `thumbnails/courses/${course_id}/${Date.now()}_${safeName}`;
      }
      else if (type === "product_thumbnail") {
        if (!product_id) return res.status(400).json({ message: "product_id required" });
        objectKey = `thumbnails/products/${product_id}/${Date.now()}_${safeName}`;
      }
      else if (type === "video") {
        if (!module_id )
          return res.status(400).json({ message: "module_id & video_id required" });
  
        objectKey = `videos/${module_id}/${Date.now()}_${safeName}`;
      }
      else if (type === "video_thumbnail") {
        if (!module_id)
          return res.status(400).json({ message: "module_id & video_id required" });
        objectKey = `thumbnails/videos/${module_id}/${Date.now()}_${safeName}`;
      }
      else if (type === "product_images") {
        if (!product_id)
          return res.status(400).json({ message: "product_id required" });
      
        objectKey = `thumbnails/images/${product_id}/${Date.now()}_${safeName}`;
      }
  
      const command = new PutObjectCommand({
        Bucket: cloude.R2_BUCKET,
        Key: objectKey,
        ContentType: mimeType,
      });
  
      const uploadUrl = await getSignedUrl(R2uploedFrom, command, { expiresIn: 3600 });
  
      return res.json({
        success: true,
        uploadUrl,
        objectKey,
      });
  
    } catch (error) {
      console.error("Dynamic Signed URL Error:", error);
      res.status(500).json({ success: false, message: "Failed to create signed URL" });
    }
  }

  /*
  async function get_Dynamic_Delete_R2_Data(req, res) {
    try {
      const { objectKey } = req.body;
  
      if (!objectKey)
        return res.status(400).json({ success: false, message: "objectKey required" });
  
      const result = await R2DeleteFrom(objectKey);
  
      return res.json(result);
  
    } catch (error) {
      console.error("Delete API Error:", error);
      res.status(500).json({ success: false, message: "Failed to delete" });
    }
  }
*/

  //single iteam delete
  async function Dynamic_Delete_R2_Data(objectKey) {
    try {
      
      if (!objectKey)
        return { success: false, message: "objectKey required" };
  
      const result = await R2DeleteFrom(objectKey);
  
      return result;
  
    } catch (error) {
      console.error("Delete API Error:", error);
      res.status(500).json({ success: false, message: "Failed to delete" });
    }
  }

// module delete
  async function deleteCourseAndModules(types, module_ids = [], course_id) {
    try {
      const deletedResults = [];
     if(types === 'courses'){
      if(course_id){
      // 1) Delete course thumbnails
      deletedResults.push(await deleteAllByPrefix(`thumbnails/courses/${course_id}`));
      }
      // 2) Delete each module videos + thumbnails
      for (const module_id of module_ids) {
        deletedResults.push(await deleteAllByPrefix(`videos/${module_id}`));
        deletedResults.push(await deleteAllByPrefix(`thumbnails/videos/${module_id}`));
      }
      return deletedResults;
     } else if (types === 'products') {
      for (const module_id of module_ids) {
        deletedResults.push(await deleteAllByPrefix(`thumbnails/images/${module_id}`));
      }
      return deletedResults;
     } else if (types === 'module') {
      for (const module_id of module_ids) {
        deletedResults.push(await deleteAllByPrefix(`videos/${module_id}`));
        deletedResults.push(await deleteAllByPrefix(`thumbnails/videos/${module_id}`));
      }
      return deletedResults;
     }
      

    } catch (error) {
      console.error("Delete Course Error:", error);
      return { success: false, message: "Failed to delete course files" };
    }
  }
  
   
module.exports = {
    add_course: add_course,
    add_course_modules : add_course_modules,
    add_videos : add_videos ,
    update_course : update_course,
    update_course_modules : update_course_modules,
    update_videos : update_videos,
    select_all_courses : select_all_courses,
    get_modules_by_course : get_modules_by_course,
    get_videos_by_module : get_videos_by_module,
    getDynamicSignedURL : getDynamicSignedURL ,
    // get_Dynamic_Delete_R2_Data : get_Dynamic_Delete_R2_Data,
    deleteCourseAndModules : deleteCourseAndModules,
    DynamicSignedURL : DynamicSignedURL,
    Dynamic_Delete_R2_Data : Dynamic_Delete_R2_Data,
    delete_Video : delete_Video ,
    delete_Module : delete_Module,
    delete_Courses : delete_Courses
}

/*

// single vidous uploued use.
async function getSignedURL(req, res) {
    try {
      const { module_id, video_title, contentType } = req.body;
      const fileName = video_title;
          console.log("data",req.body)
      if (!module_id || !fileName) {
        return res.status(400).json({ success: false, message: "module_id & fileName required" });
      }
  
      const safeName = fileName.replace(/\s/g, "_");
      const objectKey = `videos/${module_id}/${Date.now()}_${safeName}`;
  
      const command = new PutObjectCommand({
        Bucket: cloude.R2_BUCKET,
        Key: objectKey,
        ContentType: contentType || "video/mp4",
      });
  
      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  
      return res.json({
        success: true,
        uploadUrl,
        objectKey,
      });
    } catch (error) {
      console.error("Signed URL Error:", error);
      res.status(500).json({ success: false, message: "Error creating signed URL" });
    }
  }

*/
  