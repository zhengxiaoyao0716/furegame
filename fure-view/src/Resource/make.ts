import * as PIXI from 'pixi.js';
import { LoaderOptions } from '../Loader';
import { defaultClose } from '../hooks';

//#region fix fuck type
export const Resource = PIXI.LoaderResource as { new(name: string, url: string | string[], options?: LoaderOptions): PIXI.LoaderResource };
const Polygon = PIXI.Polygon as { new(...points: (PIXI.Point | number[])[]): PIXI.Polygon };
type Shape = Parameters<PIXI.Graphics['drawShape']>[0];
//#endregion

export const makeResource = {
  maker: undefined as PIXI.Renderer | undefined,
  draw(object: PIXI.DisplayObject, close: (object: PIXI.DisplayObject) => void = defaultClose) {
    if (this.maker == null) {
      this.maker = new PIXI.Renderer({ width: 0, height: 0, transparent: true });
      console.warn('[Furegame]: used `makeResource` to generate temporary resources, not recommand for production envriroments.'); // eslint-disable-line no-console
    }
    const { maker } = this; // lazy init the maker once it was used.
    const { width, height } = object.getBounds();

    // renderer the object
    maker.view.width = width;
    maker.view.height = height;
    maker.render(object);

    // generate texture
    const image = new Image();
    image.src = maker.view.toDataURL();
    const texture = new PIXI.Texture(new PIXI.BaseTexture(image));

    // clean the renderer
    maker.clear();
    maker.view.width = 0;
    maker.view.height = 0;

    close(object);

    return (id?: string, loader?: PIXI.Loader) => {
      if (id) {
        if (loader) {
          const resource = new Resource(id, `#${id}`);
          loader.resources[id] = resource;
          resource.texture = texture;
        }
        PIXI.Texture.addToCache(texture, id);
      }
      return texture;
    };
  },
  shape: (
    { fill, line }: {
      fill?: {
        color?: number;
        alpha?: number;
      };
      line?: { width?: number; color?: number; alpha?: number };
    } = {},
  ) => {
    const border = (line && line.width) ? 2 * line.width : 0;
    return {
      draw: (shape: Shape | ((graphics: PIXI.Graphics) => void)) => {
        const graphics = new PIXI.Graphics();
        fill ? graphics.beginFill(fill.color, fill.alpha) : graphics.beginFill(0x000000);
        line && graphics.lineStyle(line.width, line.color, line.alpha);
        if (shape instanceof Function) {
          shape(graphics);
        } else {
          graphics.drawShape(shape);
        }
        return makeResource.draw(graphics);
      },
      circle(radius: number) {
        return this.draw(new PIXI.Circle(border + radius, border + radius, radius));
      },
      ellipse(width: number, height: number) {
        return this.draw(new PIXI.Ellipse(border + width, border + height, width, height));
      },
      polygon(...points: PIXI.Point[]) {
        return this.draw(new Polygon(...points));
      },
      rectangle(width: number, height: number) {
        return this.draw(new PIXI.Rectangle(border, border, width, height));
      },
      roundedRectangle(width: number, height: number, radius?: number) {
        return this.draw(new PIXI.RoundedRectangle(border, border, width, height, radius));
      },
      triangle(width: number, height: number, sharp: number) {
        return this.draw(new Polygon(new PIXI.Point(border + sharp, border), new PIXI.Point(border, border + height), new PIXI.Point(border + width, border + height)));
      },
      star(points: number, radius: number, innerRadius?: number, rotation?: number) {
        return this.draw(graphics => graphics.drawStar(border + radius, border + radius, points, radius, innerRadius, rotation));
      },
    };
  },
  text: (value: string, style?: PIXI.TextStyle) => makeResource.draw(new PIXI.Text(value, style)),
};
