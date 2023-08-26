cd data/fluentui-emoji-animated
for f in *.png; do
    new="${f%.*}.gif"
    ffmpeg -loglevel error -y -i "$f" "$new"
    rm "$f"
    echo "Finished $f => $new"
done