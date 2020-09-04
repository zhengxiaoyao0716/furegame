from pathlib import Path
import sys 
from flask import Flask, render_template, redirect
import webview

root = Path(sys._MEIPASS if getattr(sys, 'frozen', False) else ".")
res_dir = str(root.joinpath('./furegame').resolve())

server = Flask(__name__, static_folder=res_dir, template_folder=res_dir)

@server.route('/furegame/')
def furegame():
    return render_template('index.html')

@server.route('/')
def index():
    return redirect('/furegame/')

def main():
    webview.create_window('Reactive Game Engine Demo', server)
    webview.start()

if __name__ == "__main__":
    main()
