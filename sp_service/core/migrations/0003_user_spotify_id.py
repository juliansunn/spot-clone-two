from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_user_token_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='spotify_id',
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
    ]
