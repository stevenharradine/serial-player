show="$1"
season="$2"
episode="$3"
fileextention="$4"
videoformat="$4"
title="$show/$season/$episode"
threads=`cat encode-threads.dat`
webPath=""

if [[ "$videoformat" -eq "fullscreen" ]]; then
	quality_x[0]=160
	quality_x[1]=320
	quality_x[2]=640

	quality_y[0]=120
	quality_y[1]=240
	quality_y[2]=480
elif [[ "$videoformat" -eq "widescreen" ]]; then
	quality_x[0]=320
	quality_x[1]=480
	quality_x[2]=1280

	quality_y[0]=180
	quality_y[1]=360
	quality_y[2]=720
fi
# download
#wget -O tmp.$fileextention "$webPath$title.$fileextention"
#wget -O $title.tbn "$webPath$title.tbn"
#wget -O metadata/$title.xml $webPath"metadata/$title.xml"

# find max quality to build master
maxy=0
maxIndex=0
for((i=0;i<${#quality_y[@]};i++))
do
        if [[ ${quality_y[$i]} -gt $maxy ]]; then
                maxy=${quality_y[$i]}
                maxIndex=$i
        fi
done

# pretask cleanup (if the script was aborted mid way through)
rm tmp.$fileextention tmp.mp4

# make master mp4
echo "Convert master"
avconv -i "$title.$fileextention" -threads $threads -acodec aac -strict experimental -ac 2 -ab 128k -vcodec libx264 -f mp4 -crf 22 -s ${quality_x[$maxIndex]}x${quality_y[$maxIndex]} tmp.mp4

# convert different sized videos
for((i=0;i<${#quality_x[@]};i++))
do
        echo "Convert watchable "${quality_y[$i]}"p"
        threads=`cat encode-threads.dat`
        avconv -i tmp.mp4 -threads $threads -s ${quality_x[$i]}x${quality_y[$i]} -c:a copy "${quality_y[$i]}p/$title.${quality_y[$i]}p.mp4"
        md5sum "${quality_y[$i]}p/$title.${quality_y[$i]}p.mp4" > "${quality_y[$i]}p/$title.${quality_y[$i]}p.md5"
        sha1sum "${quality_y[$i]}p/$title.${quality_y[$i]}p.mp4" > "${quality_y[$i]}p/$title.${quality_y[$i]}p.sha1"
done

# clean up
rm tmp.$fileextention tmp.mp4
