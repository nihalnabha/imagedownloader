import * as mammoth from "mammoth";
import axios from "axios";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const docsId= searchParams.get('docsId')

    const url = `https://docs.google.com/feeds/download/documents/export/Export?id=${docsId}&exportFormat=docx`;
    var result = await axios.get(url, { responseType: 'arraybuffer' }).catch((error) => {
      return error.message;
    });
    
    var buffers = [];

    if(result.data) {

      buffers.push(Buffer.from(result.data));
      var buffer = Buffer.concat(buffers);
      const images = [];

      var options = {
          convertImage: mammoth.images.imgElement(function(image) {
            return image.read("base64").then(function(imageBuffer) {
                const dataUri =  "data:" + image.contentType + ";base64," + imageBuffer
                images.push(dataUri);
                return { src: dataUri };
                
            });
        })
      }
      await mammoth.convertToHtml({ buffer: buffer }, options);
      return Response.json({ images: images });   
    }else{
        return Response.json({ images: [] });
        
    }

}