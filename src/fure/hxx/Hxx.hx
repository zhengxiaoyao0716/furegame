package fure.hxx;

abstract Hxx(String) from String {
	public inline function new(src:String)
		this = src;

	@:to
	public function trans():Ast {
		var stack = [];
		// TODO .
		return Node(0, "Test", Code(2, '"$this"'), [
			Node(10, "AbsTest", Code(12, "2"), []),
			Flat(20, [Node(30, "Test", Code(32, "3"), []), Node(40, "Test", Code(42, "4"), []),]),
		]);
	}
}

enum abstract State(Int) {
	var None;
	var Node;
	var TagName;
	var PropName;
	var PropValue;
	var Code;
	var Body;
	var Close;
}
