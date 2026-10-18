import json,sys,os
R=os.path.dirname(os.path.abspath(__file__))+'/../'
shell=open(R+'app/shell.html').read()
data=open(R+'data/data.json').read()
js=['data/authored/extra.js','app/core.js','app/audio.js','app/weeks.js','app/quiz.js','app/app.js','app/main.js']
code='\n'.join(open(R+f).read() for f in js)
out=shell+'\n<script>\nconst DATA='+data.replace('</','<\\/')+';\n'+code+'\n</script>\n'
os.makedirs(R+'dist',exist_ok=True)
open(R+'dist/sin-falla-n4.html','w').write(out)
print(len(out.encode()))
