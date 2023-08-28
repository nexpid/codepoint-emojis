cd data/fluentui-emoji-animated
for f in *.png; do
    gif="${f%.*}.uc.gif"
    compressed="${f%.*}.gif"
    ffmpeg -loglevel error -y -i "$f" "$gif"
    gifsicle --colors=64 --use-col=web --lossy=100 --scale 0.8 -O3 "$gif" -o "$compressed"
    rm "$f" "$gif"
    echo "Finished $f => $compressed"
done