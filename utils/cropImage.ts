import { Area } from 'react-easy-crop';

/**
 * Returns a Blob of the cropped image.
 * @param imageSrc - source of the image (URL or base64)
 * @param pixelCrop - cropping rectangle in pixel values
 * @param rotation - optional rotation in degrees (default 0)
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const rotRad = (rotation * Math.PI) / 180;

    // calculate bounding box of the rotated image
    const bBoxWidth = Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height);
    const bBoxHeight = Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height);

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    if (!ctx) throw new Error('Canvas 2D context not available');

    // translate to center and rotate
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // get the data from the rotated canvas
    const data = ctx.getImageData(0, 0, bBoxWidth, bBoxHeight);

    // set canvas to the size of the crop
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // put the cropped area onto the new canvas
    ctx.putImageData(
        data,
        Math.round(-pixelCrop.x),
        Math.round(-pixelCrop.y)
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas is empty'));
        }, 'image/jpeg');
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid CORS issues on CodeSandbox
        image.src = url;
    });
}
