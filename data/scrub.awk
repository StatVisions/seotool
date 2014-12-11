BEGIN {
FS = ",";
OFS = ",";
regex="\"[0-9]+\"";
}
NR==1 {gsub(" ",""); print $1, $2, $4, $5, $7}
$1 ~ /2014-07/ { 	gsub(".com-EN","",$2);
					gsub(";","",$4);
					gsub("www.","",$5);
					gsub(".com","",$5);

					if(match($7,regex)) {
						print $1, $2, $4, $5, $7
					} else {
						if(match($8,regex)) {
							print $1, $2, $4, $5, $8
						} else {
							print $1, $2, $4, $5, 0
						}		
					}
				}