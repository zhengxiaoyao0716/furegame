package fure.hxx;

using StringTools;

abstract Hxx(String) from String {
	public inline function new(src:String)
		this = src;

	@:to
	public function trans():Ast {
		var state = State.Space;
		var ast = [];
		var strIdx = 0;
		var stkIdx = 0;

		while (strIdx < this.length) {
			var char = this.fastCodeAt(strIdx++);
			// switch (state) {
			// 	case Space:
			// }
		}

		// TODO .
		return Node(0, "Test", Code(2, '"$this"'), [
			Node(10, "AbsTest", Code(12, "2"), []),
			Flat(20, [Node(30, "Test", Code(32, "3"), []), Node(40, "Test", Code(42, "4"), []),]),
		]);
	}
}

enum abstract State(Int) {
	var Space;
	var Begin;
	var TagName;
	var PropName;
	var PropValue;
	var Block;
	var Inner;
	var Close;
}
