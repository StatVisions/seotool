BEGIN {
FS = ",";
OFS = ",";
}
NR==1 {print $0;}
$4 ~ /"amazon"/ || /"ebay"/ || /"youtube"/ { 
gsub("Marvel","dashboard");
gsub("Hot Toys","sankey");
gsub("DC Comics","word cloud");
gsub("Star Wars","interactive");
gsub("amazon","tableau");
gsub("ebay","qlik");
gsub("youtube","visual.ly")
print $0;}