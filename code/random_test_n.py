# -*- coding: utf-8 -*-
import io,os
import random
import sqlite3

#files = [("legislazione.txt",1001),
#         ("aerodinamica.txt",2001),
#         ]

files = [ (os.getcwd()+'/quiz/'+f,int(os.path.basename(f).split('_')[0]))
          for f in os.listdir(os.getcwd()+'/quiz/') if os.path.splitext(f)[-1]=='.vds']

with open( os.getcwd()+'/quiz/soluzioni.svds','r') as solf:
    soluzioni = { int(row.strip().split()[0]):int(row.strip().split()[-1])
                  for row in solf.readlines() if len(row.split())>0 }

conn = sqlite3.connect('quiz_VDS.db')
cur = conn.cursor()

# Create table
cur.execute('''CREATE TABLE IF NOT EXISTS quiz
             (quiz_id integer primary key,
              sezione text,
              domanda text,              
              opz1 text,
              opz2 text,
              opz3 text,
              soluzione integer,
              UNIQUE(quiz_id));''')

db = {}
for file_i in files:

    qi = file_i[1]
    section = ' '.join( os.path.splitext(os.path.basename(file_i[0]))[0].split('_')[1:]).upper()
    
    with io.open(file_i[0], "r", encoding="utf-8") as my_file:
        my_unicode_string = my_file.readlines()

        n_domanda = 0
        for line in my_unicode_string:
            #print line
            #print '=='
            try:
                qn = int(float(line.split()[0]))
                #print '#'+str(qn)
                text = ' '.join( line.split()[1:] ).strip()
                #print text
                if qn > 1000.0:
                    n_domanda = int(float(line.split()[0]))
                    db[n_domanda] = { 'domanda':text,'soluzione':str(soluzioni[n_domanda]), 'sezione':section }
                    #print 'Domanda ' + str(n_domanda)
                    
                elif qn > 0 and qn < 4:
                    #print 'opz ' + str(qn)
                    if qn == 1:
                        db[n_domanda]['opz1'] = text 
                    elif qn == 2:
                        db[n_domanda]['opz2'] = text
                    elif qn == 3:
                        db[n_domanda]['opz3'] = text
                    #print '  Opzione '+str(text)

            except ValueError:
                print 'Error: '+line
                sys.exit()
                print 
                pass

            except IndexError:
                #print '--empty line--'
                pass

#populate database table
# Insert a row of data
for q_id in sorted(db.keys()):
    try:
        query = "INSERT OR IGNORE INTO quiz(quiz_id,sezione,domanda,opz1,opz2,opz3,soluzione) VALUES ('"
        query+= str(q_id)+"','"+(db[q_id]['sezione'])+"','"+(db[q_id]['domanda'].replace("'","''"))
        query+= "','"+(db[q_id]['opz1'].replace("'","''"))
        query+= "','"+(db[q_id]['opz2'].replace("'","''"))
        query+= "','"+(db[q_id]['opz3'].replace("'","''"))+"','"+(db[q_id]['soluzione'])+"');"
        #print query
        cur.execute(query)
    except KeyError:
        print 'KeyError'
        print q_id,db[q_id]
        sys.exit()
conn.commit()
conn.close()
            
##n = 10
##sel_sezione = 'legislazione'
##
##if sel_sezione.upper() in ['',None,'ALL','TUTTE']:
##    dx = sorted([ j for j in db.keys() ])
##else:
##    dx = sorted([ j for j in db.keys() if db[j]['sezione'] == sel_sezione.upper()])
##shuffled = sorted(dx, key=lambda k: random.random())
##
##domande_html = "<dl>"
##for i in sorted(shuffled[0:n]):
##    print "#" + str(i) + "\t" + db[i]['domanda']
##    domande_html += '<dt>'+"#" + str(i) + "\t" + db[i]['domanda']+'</dt>'
##    print ''
##    print '\t[ ] 1.'+db[i]['opz1']
##    domande_html += '<dd>' + '\t1.[ ] '+db[i]['opz1'] + '</dd>'
##    print '\t[ ] 2.'+db[i]['opz2']
##    domande_html += '<dd>' + '\t2.[ ] '+db[i]['opz2'] + '</dd>'
##    print '\t[ ] 3.'+db[i]['opz3']
##    domande_html += '<dd>' + '\t3.[ ] '+db[i]['opz3'] + '</dd>'
##    print '------------------------------------\n\n'
##    pass
##domande_html += '</dl>' 
##  
##with open(os.getcwd()+'/quiz_html/index.html', 'r') as template:    
##    output_html = template.read().replace('{{% output %}}',domande_html)
##with open('quiz_html/quiz.html', 'w') as template:
##    template.write(output_html.encode('utf8'))
