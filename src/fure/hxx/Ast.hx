package fure.hxx;

using Lambda;

#if macro
import haxe.macro.Context;
import haxe.macro.Expr;
import haxe.macro.TypeTools;
#end

@:using(fure.hxx.Ast.AstTools)
enum Ast {
	Node(offset:Offset, tag:String, props:Ast, inner:Array<Ast>);
	Flat(offset:Offset, inner:Array<Ast>);
	Code(offset:Offset, src:String);
}

abstract Offset(Int) from Int {
	public inline function new(offset:Int)
		this = offset;

	#if macro
	@:op(A + B)
	@:commutative
	public function add(pos:Position):Position {
		return pos;
	}
	#end
}

class AstTools {
	public static function dumps(ast:Ast):String {
		return switch (ast) {
			case Node(_, tag, props, inner): '{var props = ${props.dumps()};'
				+ (inner.empty() ? 'var inner = [];' : 'var inner = fure.hxx.Ast.Nodes.flat(${inner.map(dumps)});')
				+ 'new $tag(props, inner);}';
			case Flat(_, inner): 'new fure.hxx.Ast.Nodes(${inner.map(dumps)})';
			case Code(_, src): src;
		}
	}

	#if macro
	public static function parse(ast:Ast, pos:Position):Expr {
		// return Context.parseInlineString(ast.dumps(), pos);
		return switch (ast) {
			case Node(offset, tag, props, inner):
				var exprs = [
					{
						var propsVal = props.parse(pos);
						macro var props = $propsVal;
					},
					{
						if (inner.empty()) {
							macro var inner = [];
						} else {
							var innerVal = macro $a{inner.map(ast -> ast.parse(pos))};
							macro var inner = fure.hxx.Ast.Nodes.flat($innerVal);
						}
					},
					{
						var type = try {
							Context.getType(tag);
						} catch (error) {
							return Context.error(error.message, pos + offset);
						}
						// macro new $i{tag}(props, inner);
						// Context.parseInlineString('new ${tag}(props, inner)', pos + offset);
						var field = switch (type) {
							case TInst(_.get() => _.constructor => _.get() => field, _): field;
							case TAbstract(_.get() => {impl: _.get() => TypeTools.findField(_, "_new", true) => field}, _): field;
							case _: return Context.error('Tag "${tag}" could not used as Hxx component', pos + offset);
						}
						var path = {name: tag, params: [], pack: []};
						var params = [macro props, macro inner];
						switch (field.expr()) {
							case {t: TFun(_ => [props, inner], ret)}:
								macro ${{expr: ENew(path, params), pos: pos + offset}};
							case _: return Context.error('Invalid constructor of Hxx component "${tag}"', field.pos);
						}
					}
				];
				macro $b{exprs};
			case Flat(_, inner):
				var innerVal = macro $a{inner.map(ast -> ast.parse(pos))};
				macro new fure.hxx.Ast.Nodes($innerVal);
			case Code(offset, src): Context.parseInlineString(src, pos + offset);
		}
	}
	#end
}

class Nodes {
	public final arr:Array<Any>;

	public inline function new(nodes:Array<Any>)
		this.arr = nodes;

	public static function flat(arr:Array<Any>):Array<Any>
		return arr.flatMap(node -> Std.isOfType(node, Nodes) ? flat((node : Nodes).arr) : [node]);
}
