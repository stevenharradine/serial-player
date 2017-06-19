#!/bin/bash
show=$1
videoFormat=$2
episodesFilename=episodes.json

fileextention=mkv

cd "$show"
ls | grep Season | while read season; do
        cd "$season"

        episodeCounter=0
        numberOfEpisodes=`ls *.$fileextention | wc -l`

        echo "[" > $episodesFilename
        ls *.$fileextention | while read episode; do
                echo -n "  \"${episode:0:-4}\"" >> $episodesFilename

                if [ "$episodeCounter" -lt $(($numberOfEpisodes-1)) ]; then
                        echo "," >> $episodesFilename
                else
                        echo "" >> $episodesFilename
                fi

                episodeCounter=$((episodeCounter+1))
        done
        echo "]" >> $episodesFilename

        cd ..
done
echo $PWD
ls | grep Season | while read season; do
        cd "$season"
        echo $PWD
        ls *.$fileextention | while read episode; do
                echo "${episode:0:-4}"
                cd ../../
                bash encode.sh "$show" "$season" "${episode:0:-4}" "$fileextention" "$videoFormat"
                cd "$show"/"$season"
        done
        cd ..
done

cd ..
