import fure.hxx.Hxx;
import fure.Macro.hxx;

class Main {
	static function main() {
		// var props = { a: 1, b: "b" };
		// var child = [for (i in 0...3) hxx(<Text>{i}</Text>)];
		// var obj = hxx(
		// 	<Stage>
		// 		<>
		// 			<Light type="a" {props}/>
		// 			<Light type=${'b${1}'}/>
		// 		</>
		// 		{/* comments */}
		// 		<Layer>
		// 			{child}
		// 		</Layer>
		// 	</Stage>
		// );

		hxx('<AbsTest a=${[1, 2, 3]}/>');
		trace(new Hxx('<Test a=${[4, 5, 6]}/>').trans().dumps());
	}
}

abstract AbsTest(Any) {
	public function new(props:Any, inner: Array<Any>) {
		this = props;
		trace(props);
	}
}

class Test {
	public function new(props:Any, inner: Array<Any>) {
		trace(props);
	}
}
