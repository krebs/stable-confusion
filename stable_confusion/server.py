from flask import session,Flask,render_template,request,send_from_directory
from flask_socketio import *
import requests

# Init the server
app = Flask(__name__)
app.config['SECRET_KEY'] = 'securitaaaaaeeeeeeyyyy'
socketio = SocketIO(app, logger=True)
anon = "Anon"
sd_host = "stable-confusion.r"
# Send HTML!
@app.route('/')
def root():    
    return render_template('index.html',nick=session.get("nick",None))
 
@socketio.on('connect')
def connect():
    session["nick"] = request.sid[:6]
    emit('message_from_server',{'sender':'Server','text':f'{session["nick"]} connected'},broadcast=True)

@socketio.on('change_nick')   
def change_nick(data):
    old_nick = session.get("nick",anon)
    session["nick"] = data["nick"]
    emit('message_from_server',{'sender':'Server','text':f'{old_nick} changed nick to {session["nick"]}'},broadcast=True)

@socketio.on('send_message')   
def message_recieved(data):
    nick = session.get("nick",anon)
    emit('message_from_server',{'sender':nick, 'text':data["text"]},broadcast=True)
 
@socketio.on('choose_host')
def choose_host(data=None):
    nick = session.get("nick",anon)
    emit('message_from_server',{'sender':"Server", 'text':f'{nick} chose to become the host'},broadcast=True)
    emit('is_host')
    emit('is_guesser',broadcast=True,include_self=False)

@socketio.on('choose_guesser')
def choose_guesser(data=None):
    nick = session["nick"]
    emit('message_from_server',{'sender':"Server", 'text':f'{nick} is now a guesser'},broadcast=True)
    emit('is_guesser',{"nick":nick})
    
@socketio.on('choose_winner')
def announce_winner(data):
    nick = data["nick"]
    prompt = data["prompt"]
    emit('message_from_server',{'sender':"Server", 'text':f'{nick} is the winner of this round with "{prompt}". Congratulations!!!'},broadcast=True)
    emit('new_game',broadcast=True)

@socketio.on('send_guess')
def receive_guess(data=None):
    nick = session["nick"]
    prompt = data["prompt"]
    # TODO: only send the guess to the host
    emit('message_from_server',{'sender':"Server", 'text':f'{nick} submitted its guess'},broadcast=True)
    emit('host_receive_guess',{"nick":nick,"prompt":prompt},broadcast=True)

@socketio.on("choose_host_pic")
def send_host_pic_to_guesser(data):
    image_idx = data["image"]
    send_data = {
        "image": session["images"][image_idx]
    }
    emit('message_from_server',{'sender':"Server", 'text':f'Host chose an image {image_idx}'},broadcast=True)
    emit('guesser_send_pic',send_data,broadcast=True,include_self=False)


@socketio.on("host_prompt_submit")
def generate_from_host_prompt(data):
    prompt = data["prompt"]
    nick = session["nick"]
    request_data = { 
        "batch_size": 4, 
        "prompt": prompt
    }
        
    emit('message_from_server',{'sender':"Server", 'text':f'{nick} submitted a prompt'},broadcast=True)
    response = requests.post(f"http://{sd_host}/sdapi/v1/txt2img", json=request_data)
    if response.status_code == 200:
        # cache the images in the session
        images = session["images"] = response.json()["images"]
        session["prompt"] = prompt
        emit('message_from_server',{'sender':"Server", 'text':f'Image Generation complete'},broadcast=True)
        emit('host_prompt_reply',{
            "images": images
        })
    else:
        emit('message_from_server',{'sender':"Server", 'text':f'Image Generation failed, please try again'},broadcast=True)


    
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')
# Actually Start the App
if __name__ == '__main__':
    """ Run the app. """    
    socketio.run(app, host="0",port=8000, debug=True)